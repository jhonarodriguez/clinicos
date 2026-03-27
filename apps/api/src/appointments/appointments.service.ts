import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AvailabilityService } from '../availability/availability.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { ListAppointmentsDto } from './dto/list-appointments.dto'

const APPOINTMENT_INCLUDE = {
  patient: { select: { id: true, firstName: true, firstLastName: true, documentNumber: true } },
  professional: {
    include: { user: { select: { firstName: true, lastName: true } } },
  },
  site: { select: { id: true, name: true } },
  serviceType: { select: { id: true, name: true, defaultDurationMin: true } },
  specialty: { select: { id: true, name: true } },
  room: { select: { id: true, name: true } },
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
  ) {}

  async findAll(query: ListAppointmentsDto, tenantId: string) {
    const { professionalId, patientId, siteId, serviceTypeId, startDate, endDate, status } = query

    const statusList = status ? status.split(',').map((s) => s.trim()) : undefined
    const rangeStart = startDate ? new Date(`${startDate}T00:00:00.000Z`) : undefined
    const rangeEnd = endDate ? new Date(`${endDate}T23:59:59.999Z`) : undefined

    return this.prisma.appointment.findMany({
      where: {
        tenantId,
        ...(professionalId && { professionalId }),
        ...(patientId && { patientId }),
        ...(siteId && { siteId }),
        ...(serviceTypeId && { serviceTypeId }),
        ...(statusList && { status: { in: statusList } }),
        ...(rangeStart && { scheduledStart: { gte: rangeStart } }),
        ...(rangeEnd && { scheduledStart: { lte: rangeEnd } }),
      },
      include: APPOINTMENT_INCLUDE,
      orderBy: { scheduledStart: 'asc' },
    })
  }

  async findOne(id: string, tenantId: string) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id, tenantId },
      include: APPOINTMENT_INCLUDE,
    })
    if (!appt) throw new NotFoundException('Cita no encontrada')
    return appt
  }

  async create(dto: CreateAppointmentDto, tenantId: string, createdBy: string) {
    const { scheduledStart, scheduledEnd, forceOverbooking, ...rest } = dto

    // 1. Obtener tipo de servicio para calcular fin si no se provee
    const serviceType = await this.prisma.serviceType.findFirst({
      where: { id: dto.serviceTypeId, tenantId, isActive: true },
      select: { defaultDurationMin: true, requiresAuthorization: true },
    })
    if (!serviceType) throw new NotFoundException('Tipo de servicio no encontrado')

    const start = new Date(scheduledStart)
    const end = scheduledEnd
      ? new Date(scheduledEnd)
      : new Date(start.getTime() + serviceType.defaultDurationMin * 60_000)

    if (end <= start) throw new BadRequestException('La hora de fin debe ser posterior a la de inicio')

    // 2. Verificar disponibilidad (a menos que sea overbooking forzado)
    if (!forceOverbooking) {
      const dateStr = scheduledStart.split('T')[0]!
      const slots = await this.availability.getSlots(
        {
          professionalId: dto.professionalId,
          serviceTypeId: dto.serviceTypeId,
          siteId: dto.siteId,
          date: dateStr,
          roomId: dto.roomId,
        },
        tenantId,
      )

      // Buscar el slot exacto al que corresponde el inicio solicitado
      const targetSlot = slots.find((s) => new Date(s.start).getTime() === start.getTime())

      if (!targetSlot) {
        throw new ConflictException(
          'El horario seleccionado no está dentro del horario de atención del profesional',
        )
      }
      if (!targetSlot.available) {
        throw new ConflictException(
          targetSlot.reason === 'blocked'
            ? 'El profesional tiene un bloqueo de agenda en ese horario'
            : 'El slot está lleno. Use forceOverbooking=true para forzar overbooking',
        )
      }
    }

    // 3. Verificar si hay un bloqueo activo para el profesional en ese rango
    const block = await this.prisma.scheduleBlock.findFirst({
      where: {
        tenantId,
        professionalId: dto.professionalId,
        startDatetime: { lt: end },
        endDatetime: { gt: start },
      },
    })
    if (block) {
      throw new ConflictException('El profesional tiene un bloqueo de agenda en ese horario')
    }

    // 4. Determinar si es overbooking
    const existingCount = await this.prisma.appointment.count({
      where: {
        tenantId,
        professionalId: dto.professionalId,
        scheduledStart: { lt: end },
        scheduledEnd: { gt: start },
        status: { notIn: ['cancelled', 'no_show'] },
      },
    })
    const isOverbooking = existingCount > 0 && !!forceOverbooking

    return this.prisma.appointment.create({
      data: {
        tenantId,
        patientId: rest.patientId,
        professionalId: rest.professionalId,
        siteId: rest.siteId,
        serviceTypeId: rest.serviceTypeId,
        specialtyId: rest.specialtyId ?? null,
        roomId: rest.roomId ?? null,
        scheduledStart: start,
        scheduledEnd: end,
        isFirstVisit: rest.isFirstVisit ?? false,
        isOverbooking,
        authorizationNumber: rest.authorizationNumber ?? null,
        source: rest.source ?? 'reception',
        notes: rest.notes ?? null,
        status: 'scheduled',
        createdBy,
      },
      include: APPOINTMENT_INCLUDE,
    })
  }

  async update(id: string, dto: UpdateAppointmentDto, tenantId: string) {
    const appt = await this.findOne(id, tenantId)

    // Validaciones de transición de estado
    if (dto.status === 'cancelled' && !dto.cancellationReason) {
      throw new BadRequestException('Se requiere motivo de cancelación')
    }
    if (appt.status === 'completed' || appt.status === 'cancelled') {
      throw new BadRequestException(`No se puede modificar una cita en estado ${appt.status}`)
    }

    const now = new Date()
    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.actualStart && { actualStart: new Date(dto.actualStart) }),
        ...(dto.actualEnd && { actualEnd: new Date(dto.actualEnd) }),
        ...(dto.arrivalAt && { arrivalAt: new Date(dto.arrivalAt) }),
        ...(dto.cancellationReason && { cancellationReason: dto.cancellationReason }),
        ...(dto.cancelledBy && { cancelledBy: dto.cancelledBy }),
        ...(dto.status === 'cancelled' && { cancelledAt: now }),
        ...(dto.authorizationNumber !== undefined && { authorizationNumber: dto.authorizationNumber }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.roomId !== undefined && { roomId: dto.roomId || null }),
      },
      include: APPOINTMENT_INCLUDE,
    })
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId)
    return this.prisma.appointment.delete({ where: { id } })
  }
}
