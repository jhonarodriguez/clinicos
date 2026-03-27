import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateServiceTypeDto } from './dto/create-service-type.dto'
import { UpdateServiceTypeDto } from './dto/update-service-type.dto'
import { AddRequirementDto } from './dto/add-requirement.dto'

const SERVICE_TYPE_SELECT = {
  id: true, tenantId: true,
  name: true, code: true, cupsCode: true, category: true,
  defaultDurationMin: true, recoveryDurationMin: true, cleanupDurationMin: true,
  requiresSedation: true, requiresCompanion: true, requiresAuthorization: true,
  requiresConsent: true, canSelfSchedule: true,
  isActive: true, createdAt: true, updatedAt: true,
  resourceRequirements: {
    select: {
      id: true, resourceType: true, resourceValue: true, quantity: true, isRequired: true,
    },
  },
} as const

@Injectable()
export class ServiceTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, isActive = true) {
    return this.prisma.serviceType.findMany({
      where: { tenantId, isActive },
      select: SERVICE_TYPE_SELECT,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
  }

  async findOne(id: string, tenantId: string) {
    const st = await this.prisma.serviceType.findFirst({
      where: { id, tenantId },
      select: SERVICE_TYPE_SELECT,
    })
    if (!st) throw new NotFoundException('Tipo de servicio no encontrado')
    return st
  }

  async create(dto: CreateServiceTypeDto, tenantId: string) {
    if (dto.code) {
      const exists = await this.prisma.serviceType.findFirst({
        where: { tenantId, code: dto.code },
      })
      if (exists) throw new ConflictException('Ya existe un tipo de servicio con ese código')
    }
    return this.prisma.serviceType.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        cupsCode: dto.cupsCode,
        category: dto.category,
        defaultDurationMin: dto.defaultDurationMin,
        recoveryDurationMin: dto.recoveryDurationMin ?? 0,
        cleanupDurationMin: dto.cleanupDurationMin ?? 0,
        requiresSedation: dto.requiresSedation ?? false,
        requiresCompanion: dto.requiresCompanion ?? false,
        requiresAuthorization: dto.requiresAuthorization ?? false,
        requiresConsent: dto.requiresConsent ?? false,
        canSelfSchedule: dto.canSelfSchedule ?? false,
      },
      select: SERVICE_TYPE_SELECT,
    })
  }

  async update(id: string, dto: UpdateServiceTypeDto, tenantId: string) {
    await this.findOne(id, tenantId)
    return this.prisma.serviceType.update({
      where: { id },
      data: dto,
      select: SERVICE_TYPE_SELECT,
    })
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId)
    await this.prisma.serviceType.update({ where: { id }, data: { isActive: false } })
    return { message: 'Tipo de servicio desactivado' }
  }

  // ── Resource requirements ──────────────────────────────────────────────────

  async addRequirement(serviceTypeId: string, dto: AddRequirementDto, tenantId: string) {
    await this.findOne(serviceTypeId, tenantId)
    const exists = await this.prisma.serviceResourceRequirement.findFirst({
      where: { serviceTypeId, resourceType: dto.resourceType, resourceValue: dto.resourceValue },
    })
    if (exists) throw new ConflictException('Ya existe ese requerimiento para este servicio')
    return this.prisma.serviceResourceRequirement.create({
      data: {
        serviceTypeId,
        resourceType: dto.resourceType,
        resourceValue: dto.resourceValue,
        quantity: dto.quantity ?? 1,
        isRequired: dto.isRequired ?? true,
      },
    })
  }

  async removeRequirement(serviceTypeId: string, requirementId: string, tenantId: string) {
    await this.findOne(serviceTypeId, tenantId)
    const req = await this.prisma.serviceResourceRequirement.findFirst({
      where: { id: requirementId, serviceTypeId },
    })
    if (!req) throw new NotFoundException('Requerimiento no encontrado')
    await this.prisma.serviceResourceRequirement.delete({ where: { id: requirementId } })
    return { message: 'Requerimiento eliminado' }
  }
}
