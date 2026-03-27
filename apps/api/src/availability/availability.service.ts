import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { GetSlotsDto } from './dto/get-slots.dto'

export interface TimeSlot {
  start: string        // ISO 8601
  end: string          // ISO 8601
  available: boolean
  bookedCount: number
  maxCapacity: number  // 1 + maxOverbooking
  reason?: string      // 'blocked' | 'full'
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getSlots(query: GetSlotsDto, tenantId: string): Promise<TimeSlot[]> {
    const { professionalId, serviceTypeId, siteId, date, roomId } = query

    // 1. Obtener tipo de servicio para saber duración
    const serviceType = await this.prisma.serviceType.findFirst({
      where: { id: serviceTypeId, tenantId, isActive: true },
      select: { defaultDurationMin: true },
    })
    if (!serviceType) throw new NotFoundException('Tipo de servicio no encontrado')

    // 2. Calcular día de la semana (0=Domingo, 6=Sábado)
    const targetDate = new Date(`${date}T00:00:00.000Z`)
    const dayOfWeek = targetDate.getUTCDay()

    // 3. Obtener horario del profesional para ese día
    const schedule = await this.prisma.professionalSchedule.findFirst({
      where: {
        tenantId,
        professionalId,
        siteId,
        dayOfWeek,
        isActive: true,
        validFrom: { lte: targetDate },
        OR: [{ validUntil: null }, { validUntil: { gte: targetDate } }],
      },
    })
    if (!schedule) return [] // No hay horario ese día

    // 4. Verificar si el tipo de servicio está permitido en ese horario
    if (
      schedule.allowedServiceTypes.length > 0 &&
      !schedule.allowedServiceTypes.includes(serviceTypeId)
    ) {
      return []
    }

    // 5. Generar slots con la duración del servicio
    const slotDuration = serviceType.defaultDurationMin
    const slots = this.generateSlots(schedule.startTime, schedule.endTime, slotDuration, date)

    // 6. Obtener citas existentes del profesional ese día
    const dayStart = new Date(`${date}T00:00:00.000Z`)
    const dayEnd = new Date(`${date}T23:59:59.999Z`)

    const appointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        professionalId,
        scheduledStart: { gte: dayStart, lte: dayEnd },
        status: { notIn: ['cancelled', 'no_show'] },
      },
      select: { scheduledStart: true, scheduledEnd: true },
    })

    // 7. Obtener bloqueos de agenda que afecten al profesional ese día
    const profBlocks = await this.prisma.scheduleBlock.findMany({
      where: {
        tenantId,
        professionalId,
        startDatetime: { lt: dayEnd },
        endDatetime: { gt: dayStart },
      },
      select: { startDatetime: true, endDatetime: true, allDay: true },
    })

    // 8. Si se solicita consultorio específico, obtener también bloqueos del consultorio
    const roomBlocks = roomId
      ? await this.prisma.scheduleBlock.findMany({
          where: {
            tenantId,
            roomId,
            startDatetime: { lt: dayEnd },
            endDatetime: { gt: dayStart },
          },
          select: { startDatetime: true, endDatetime: true, allDay: true },
        })
      : []

    const allBlocks = [...profBlocks, ...roomBlocks]
    const maxCapacity = 1 + schedule.maxOverbooking

    // 9. Evaluar cada slot
    return slots.map((slot) => {
      const slotStart = new Date(slot.start)
      const slotEnd = new Date(slot.end)

      // Verificar bloqueos
      const isBlocked = allBlocks.some(
        (b) => b.allDay || (b.startDatetime < slotEnd && b.endDatetime > slotStart),
      )
      if (isBlocked) {
        return { ...slot, available: false, bookedCount: 0, maxCapacity, reason: 'blocked' }
      }

      // Contar citas que se solapan con este slot
      const bookedCount = appointments.filter(
        (a) => a.scheduledStart < slotEnd && a.scheduledEnd > slotStart,
      ).length

      const available = bookedCount < maxCapacity
      return {
        ...slot,
        available,
        bookedCount,
        maxCapacity,
        ...(available ? {} : { reason: 'full' }),
      }
    })
  }

  private generateSlots(
    startTimePrisma: Date,
    endTimePrisma: Date,
    durationMin: number,
    dateStr: string,
  ): Pick<TimeSlot, 'start' | 'end'>[] {
    // Prisma Time type stores as 1970-01-01THH:MM:00.000Z
    const startMinutes =
      startTimePrisma.getUTCHours() * 60 + startTimePrisma.getUTCMinutes()
    const endMinutes =
      endTimePrisma.getUTCHours() * 60 + endTimePrisma.getUTCMinutes()

    const slots: Pick<TimeSlot, 'start' | 'end'>[] = []
    let cursor = startMinutes

    while (cursor + durationMin <= endMinutes) {
      const slotStartStr = `${dateStr}T${this.minutesToTime(cursor)}:00`
      const slotEndStr = `${dateStr}T${this.minutesToTime(cursor + durationMin)}:00`
      slots.push({ start: slotStartStr, end: slotEndStr })
      cursor += durationMin
    }

    return slots
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0')
    const m = (minutes % 60).toString().padStart(2, '0')
    return `${h}:${m}`
  }
}
