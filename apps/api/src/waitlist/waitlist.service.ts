import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto'
import { UpdateWaitlistEntryDto } from './dto/update-waitlist-entry.dto'
import { ListWaitlistDto } from './dto/list-waitlist.dto'

const WAITLIST_INCLUDE = {
  patient: { select: { id: true, firstName: true, firstSurname: true, documentNumber: true } },
  serviceType: { select: { id: true, name: true } },
  preferredProfessional: {
    include: { user: { select: { firstName: true, lastName: true } } },
  },
}

@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListWaitlistDto, tenantId: string) {
    const { serviceTypeId, patientId, preferredProfessionalId, status, priority } = query
    return this.prisma.waitlistEntry.findMany({
      where: {
        tenantId,
        ...(serviceTypeId && { serviceTypeId }),
        ...(patientId && { patientId }),
        ...(preferredProfessionalId && { preferredProfessionalId }),
        ...(status && { status }),
        ...(priority && { priority }),
      },
      include: WAITLIST_INCLUDE,
      orderBy: [
        { priority: 'asc' },   // urgent → high → normal → low (alphabetical coincides)
        { createdAt: 'asc' },
      ],
    })
  }

  async findOne(id: string, tenantId: string) {
    const entry = await this.prisma.waitlistEntry.findFirst({
      where: { id, tenantId },
      include: WAITLIST_INCLUDE,
    })
    if (!entry) throw new NotFoundException('Entrada de lista de espera no encontrada')
    return entry
  }

  async create(dto: CreateWaitlistEntryDto, tenantId: string) {
    return this.prisma.waitlistEntry.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        serviceTypeId: dto.serviceTypeId,
        preferredProfessionalId: dto.preferredProfessionalId ?? null,
        preferredSiteId: dto.preferredSiteId ?? null,
        dateRangeStart: dto.dateRangeStart ? new Date(dto.dateRangeStart) : null,
        dateRangeEnd: dto.dateRangeEnd ? new Date(dto.dateRangeEnd) : null,
        preferredTime: dto.preferredTime ?? 'any',
        priority: dto.priority ?? 'normal',
        status: 'waiting',
      },
      include: WAITLIST_INCLUDE,
    })
  }

  async update(id: string, dto: UpdateWaitlistEntryDto, tenantId: string) {
    await this.findOne(id, tenantId)
    return this.prisma.waitlistEntry.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.notifiedAt && { notifiedAt: new Date(dto.notifiedAt) }),
        ...(dto.notificationExpiresAt && { notificationExpiresAt: new Date(dto.notificationExpiresAt) }),
        ...(dto.dateRangeStart !== undefined && {
          dateRangeStart: dto.dateRangeStart ? new Date(dto.dateRangeStart) : null,
        }),
        ...(dto.dateRangeEnd !== undefined && {
          dateRangeEnd: dto.dateRangeEnd ? new Date(dto.dateRangeEnd) : null,
        }),
      },
      include: WAITLIST_INCLUDE,
    })
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId)
    return this.prisma.waitlistEntry.delete({ where: { id } })
  }
}
