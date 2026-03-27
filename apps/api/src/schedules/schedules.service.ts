import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { ListSchedulesDto } from './dto/list-schedules.dto'

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListSchedulesDto, tenantId: string) {
    const { professionalId, siteId, dayOfWeek, isActive } = query
    return this.prisma.professionalSchedule.findMany({
      where: {
        tenantId,
        ...(professionalId && { professionalId }),
        ...(siteId && { siteId }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      include: {
        professional: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
        site: { select: { id: true, name: true } },
      },
      orderBy: [{ professionalId: 'asc' }, { dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })
  }

  async findOne(id: string, tenantId: string) {
    const schedule = await this.prisma.professionalSchedule.findFirst({
      where: { id, tenantId },
      include: {
        professional: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
        site: { select: { id: true, name: true } },
      },
    })
    if (!schedule) throw new NotFoundException('Horario no encontrado')
    return schedule
  }

  async create(dto: CreateScheduleDto, tenantId: string) {
    const { professionalId, siteId, dayOfWeek, startTime, endTime, validFrom, validUntil, ...rest } = dto

    // Verificar que no exista un horario activo solapado para el mismo profesional/sede/día
    const startTimeDate = this.parseTime(startTime)
    const endTimeDate = this.parseTime(endTime)
    const validFromDate = new Date(validFrom)
    const validUntilDate = validUntil ? new Date(validUntil) : null

    const conflict = await this.prisma.professionalSchedule.findFirst({
      where: {
        tenantId,
        professionalId,
        siteId,
        dayOfWeek,
        isActive: true,
        validFrom: { lte: validUntilDate ?? new Date('9999-12-31') },
        OR: [{ validUntil: null }, { validUntil: { gte: validFromDate } }],
        AND: [
          { startTime: { lt: endTimeDate } },
          { endTime: { gt: startTimeDate } },
        ],
      },
    })

    if (conflict) {
      throw new ConflictException(
        'Ya existe un horario activo que se solapa en ese día/horario para este profesional y sede',
      )
    }

    return this.prisma.professionalSchedule.create({
      data: {
        tenantId,
        professionalId,
        siteId,
        dayOfWeek,
        startTime: startTimeDate,
        endTime: endTimeDate,
        validFrom: validFromDate,
        validUntil: validUntilDate,
        slotDurationMin: rest.slotDurationMin ?? 20,
        maxOverbooking: rest.maxOverbooking ?? 0,
        allowedServiceTypes: rest.allowedServiceTypes ?? [],
        isActive: rest.isActive ?? true,
      },
    })
  }

  async update(id: string, dto: UpdateScheduleDto, tenantId: string) {
    await this.findOne(id, tenantId)
    const { startTime, endTime, validFrom, validUntil, ...rest } = dto

    return this.prisma.professionalSchedule.update({
      where: { id },
      data: {
        ...rest,
        ...(startTime && { startTime: this.parseTime(startTime) }),
        ...(endTime && { endTime: this.parseTime(endTime) }),
        ...(validFrom && { validFrom: new Date(validFrom) }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
      },
    })
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId)
    return this.prisma.professionalSchedule.delete({ where: { id } })
  }

  private parseTime(time: string): Date {
    // Converts "HH:MM" to a Date where the date portion is 1970-01-01 (Prisma Time type)
    const parts = time.split(':').map(Number)
    const hours = parts[0] ?? 0
    const minutes = parts[1] ?? 0
    const d = new Date(0)
    d.setUTCHours(hours, minutes, 0, 0)
    return d
  }
}
