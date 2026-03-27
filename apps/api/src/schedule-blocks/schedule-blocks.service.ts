import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBlockDto } from './dto/create-block.dto'
import { ListBlocksDto } from './dto/list-blocks.dto'

@Injectable()
export class ScheduleBlocksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListBlocksDto, tenantId: string) {
    const { professionalId, roomId, equipmentId, startDate, endDate } = query
    const rangeStart = startDate ? new Date(`${startDate}T00:00:00.000Z`) : undefined
    const rangeEnd = endDate ? new Date(`${endDate}T23:59:59.999Z`) : undefined

    return this.prisma.scheduleBlock.findMany({
      where: {
        tenantId,
        ...(professionalId && { professionalId }),
        ...(roomId && { roomId }),
        ...(equipmentId && { equipmentId }),
        ...(rangeStart && { endDatetime: { gte: rangeStart } }),
        ...(rangeEnd && { startDatetime: { lte: rangeEnd } }),
      },
      include: {
        professional: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        room: { select: { id: true, name: true } },
        equipment: { select: { id: true, name: true } },
        createdByUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { startDatetime: 'asc' },
    })
  }

  async findOne(id: string, tenantId: string) {
    const block = await this.prisma.scheduleBlock.findFirst({
      where: { id, tenantId },
      include: {
        professional: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        room: { select: { id: true, name: true } },
        equipment: { select: { id: true, name: true } },
        createdByUser: { select: { firstName: true, lastName: true } },
      },
    })
    if (!block) throw new NotFoundException('Bloqueo no encontrado')
    return block
  }

  async create(dto: CreateBlockDto, tenantId: string, createdBy: string) {
    if (!dto.professionalId && !dto.roomId && !dto.equipmentId) {
      throw new BadRequestException('Debe especificar al menos un profesional, consultorio o equipo a bloquear')
    }

    const start = new Date(dto.startDatetime)
    const end = new Date(dto.endDatetime)
    if (end <= start) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la de inicio')
    }

    return this.prisma.scheduleBlock.create({
      data: {
        tenantId,
        blockType: dto.blockType,
        professionalId: dto.professionalId ?? null,
        roomId: dto.roomId ?? null,
        equipmentId: dto.equipmentId ?? null,
        startDatetime: start,
        endDatetime: end,
        allDay: dto.allDay ?? false,
        reason: dto.reason ?? null,
        createdBy,
      },
    })
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId)
    return this.prisma.scheduleBlock.delete({ where: { id } })
  }
}
