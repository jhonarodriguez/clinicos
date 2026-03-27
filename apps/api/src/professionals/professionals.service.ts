import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProfessionalDto } from './dto/create-professional.dto'
import { UpdateProfessionalDto } from './dto/update-professional.dto'
import { CreateSpecialtyDto } from './dto/create-specialty.dto'

const PROFESSIONAL_SELECT = {
  id: true, tenantId: true, userId: true,
  documentType: true, documentNumber: true,
  professionalCard: true, registrationNumber: true,
  isActive: true, createdAt: true, updatedAt: true,
  user: {
    select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
  },
  specialties: {
    select: {
      id: true, isPrimary: true,
      specialty: { select: { id: true, name: true, code: true } },
    },
  },
} as const

const SPECIALTY_SELECT = {
  id: true, tenantId: true, name: true, code: true, parentId: true, isActive: true, createdAt: true,
} as const

@Injectable()
export class ProfessionalsService {
  constructor(private prisma: PrismaService) {}

  // ── Specialties ────────────────────────────────────────────────────────────

  async findAllSpecialties(tenantId: string) {
    return this.prisma.specialty.findMany({
      where: { OR: [{ tenantId }, { tenantId: null }], isActive: true },
      select: SPECIALTY_SELECT,
      orderBy: { name: 'asc' },
    })
  }

  async createSpecialty(dto: CreateSpecialtyDto, tenantId: string) {
    return this.prisma.specialty.create({
      data: { tenantId, name: dto.name, code: dto.code, parentId: dto.parentId },
      select: SPECIALTY_SELECT,
    })
  }

  // ── Professionals ──────────────────────────────────────────────────────────

  async findAll(tenantId: string, isActive = true) {
    return this.prisma.professional.findMany({
      where: { tenantId, isActive },
      select: PROFESSIONAL_SELECT,
      orderBy: [{ user: { lastName: 'asc' } }],
    })
  }

  async findOne(id: string, tenantId: string) {
    const p = await this.prisma.professional.findFirst({
      where: { id, tenantId },
      select: PROFESSIONAL_SELECT,
    })
    if (!p) throw new NotFoundException('Profesional no encontrado')
    return p
  }

  async create(dto: CreateProfessionalDto, tenantId: string) {
    const existsByUser = await this.prisma.professional.findFirst({
      where: { tenantId, userId: dto.userId },
    })
    if (existsByUser) throw new ConflictException('Este usuario ya está registrado como profesional en este tenant')

    const existsByDoc = await this.prisma.professional.findFirst({
      where: { tenantId, documentNumber: dto.documentNumber },
    })
    if (existsByDoc) throw new ConflictException('Ya existe un profesional con ese número de documento')

    return this.prisma.professional.create({
      data: {
        tenantId,
        userId: dto.userId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        professionalCard: dto.professionalCard,
        registrationNumber: dto.registrationNumber,
        ...(dto.specialties && dto.specialties.length > 0 && {
          specialties: {
            create: dto.specialties.map(s => ({
              specialtyId: s.specialtyId,
              isPrimary: s.isPrimary ?? false,
            })),
          },
        }),
      },
      select: PROFESSIONAL_SELECT,
    })
  }

  async update(id: string, dto: UpdateProfessionalDto, tenantId: string) {
    await this.findOne(id, tenantId)
    return this.prisma.professional.update({
      where: { id },
      data: {
        ...(dto.professionalCard !== undefined && { professionalCard: dto.professionalCard }),
        ...(dto.registrationNumber !== undefined && { registrationNumber: dto.registrationNumber }),
      },
      select: PROFESSIONAL_SELECT,
    })
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId)
    await this.prisma.professional.update({ where: { id }, data: { isActive: false } })
    return { message: 'Profesional desactivado' }
  }

  // ── Specialty assignments ──────────────────────────────────────────────────

  async assignSpecialty(professionalId: string, specialtyId: string, isPrimary: boolean, tenantId: string) {
    await this.findOne(professionalId, tenantId)
    const exists = await this.prisma.professionalSpecialty.findFirst({
      where: { professionalId, specialtyId },
    })
    if (exists) throw new ConflictException('Esta especialidad ya está asignada al profesional')
    return this.prisma.professionalSpecialty.create({
      data: { professionalId, specialtyId, isPrimary },
    })
  }

  async removeSpecialty(professionalId: string, specialtyId: string, tenantId: string) {
    await this.findOne(professionalId, tenantId)
    const entry = await this.prisma.professionalSpecialty.findFirst({
      where: { professionalId, specialtyId },
    })
    if (!entry) throw new NotFoundException('Especialidad no asignada a este profesional')
    await this.prisma.professionalSpecialty.delete({ where: { id: entry.id } })
    return { message: 'Especialidad removida' }
  }
}
