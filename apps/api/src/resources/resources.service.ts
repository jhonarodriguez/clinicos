import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRoomDto } from './dto/create-room.dto'
import { UpdateRoomDto } from './dto/update-room.dto'
import { CreateEquipmentDto } from './dto/create-equipment.dto'
import { UpdateEquipmentDto } from './dto/update-equipment.dto'
import { ListResourcesDto } from './dto/list-resources.dto'

const ROOM_SELECT = {
  id: true, tenantId: true, siteId: true,
  name: true, code: true, roomType: true,
  capacity: true, floor: true, isActive: true,
  createdAt: true, updatedAt: true,
} as const

const EQUIPMENT_SELECT = {
  id: true, tenantId: true, siteId: true, roomId: true,
  name: true, code: true, equipmentType: true,
  brand: true, model: true, serialNumber: true,
  maintenanceStatus: true, lastMaintenanceAt: true, nextMaintenanceAt: true,
  isActive: true, createdAt: true, updatedAt: true,
} as const

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  // ── Rooms ──────────────────────────────────────────────────────────────────

  async findAllRooms(tenantId: string, query: ListResourcesDto) {
    const isActive = query.isActive ?? true
    return this.prisma.room.findMany({
      where: {
        tenantId,
        isActive,
        ...(query.siteId ? { siteId: query.siteId } : {}),
      },
      select: ROOM_SELECT,
      orderBy: [{ name: 'asc' }],
    })
  }

  async findOneRoom(id: string, tenantId: string) {
    const room = await this.prisma.room.findFirst({ where: { id, tenantId }, select: ROOM_SELECT })
    if (!room) throw new NotFoundException('Consultorio no encontrado')
    return room
  }

  async createRoom(dto: CreateRoomDto, tenantId: string) {
    if (dto.code) {
      const exists = await this.prisma.room.findFirst({
        where: { tenantId, siteId: dto.siteId, code: dto.code },
      })
      if (exists) throw new ConflictException('Ya existe un consultorio con ese código en esta sede')
    }
    return this.prisma.room.create({
      data: { tenantId, ...dto },
      select: ROOM_SELECT,
    })
  }

  async updateRoom(id: string, dto: UpdateRoomDto, tenantId: string) {
    await this.findOneRoom(id, tenantId)
    return this.prisma.room.update({ where: { id }, data: dto, select: ROOM_SELECT })
  }

  async removeRoom(id: string, tenantId: string) {
    await this.findOneRoom(id, tenantId)
    await this.prisma.room.update({ where: { id }, data: { isActive: false } })
    return { message: 'Consultorio desactivado' }
  }

  // ── Equipment ──────────────────────────────────────────────────────────────

  async findAllEquipment(tenantId: string, query: ListResourcesDto) {
    const isActive = query.isActive ?? true
    return this.prisma.equipment.findMany({
      where: {
        tenantId,
        isActive,
        ...(query.siteId ? { siteId: query.siteId } : {}),
      },
      select: EQUIPMENT_SELECT,
      orderBy: [{ name: 'asc' }],
    })
  }

  async findOneEquipment(id: string, tenantId: string) {
    const eq = await this.prisma.equipment.findFirst({ where: { id, tenantId }, select: EQUIPMENT_SELECT })
    if (!eq) throw new NotFoundException('Equipo no encontrado')
    return eq
  }

  async createEquipment(dto: CreateEquipmentDto, tenantId: string) {
    return this.prisma.equipment.create({
      data: {
        tenantId,
        siteId: dto.siteId,
        name: dto.name,
        code: dto.code,
        equipmentType: dto.equipmentType,
        brand: dto.brand,
        model: dto.model,
        serialNumber: dto.serialNumber,
        roomId: dto.roomId,
        maintenanceStatus: dto.maintenanceStatus ?? 'operational',
        lastMaintenanceAt: dto.lastMaintenanceAt ? new Date(dto.lastMaintenanceAt) : null,
        nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : null,
      },
      select: EQUIPMENT_SELECT,
    })
  }

  async updateEquipment(id: string, dto: UpdateEquipmentDto, tenantId: string) {
    await this.findOneEquipment(id, tenantId)
    return this.prisma.equipment.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.equipmentType !== undefined && { equipmentType: dto.equipmentType }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.serialNumber !== undefined && { serialNumber: dto.serialNumber }),
        ...(dto.roomId !== undefined && { roomId: dto.roomId }),
        ...(dto.maintenanceStatus !== undefined && { maintenanceStatus: dto.maintenanceStatus }),
        ...(dto.lastMaintenanceAt !== undefined && { lastMaintenanceAt: dto.lastMaintenanceAt ? new Date(dto.lastMaintenanceAt) : null }),
        ...(dto.nextMaintenanceAt !== undefined && { nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : null }),
      },
      select: EQUIPMENT_SELECT,
    })
  }

  async removeEquipment(id: string, tenantId: string) {
    await this.findOneEquipment(id, tenantId)
    await this.prisma.equipment.update({ where: { id }, data: { isActive: false } })
    return { message: 'Equipo desactivado' }
  }
}
