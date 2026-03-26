import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { UpdateTenantDto } from './dto/update-tenant.dto'

const FEATURES = [
  { key: 'agenda', label: 'Agenda y Citas', description: 'Gestión de citas y calendario' },
  { key: 'historia_clinica', label: 'Historia Clínica', description: 'Documentación clínica con firma digital' },
  { key: 'procedimientos', label: 'Procedimientos Endoscópicos', description: 'Reportes de procedimientos con firma doble' },
  { key: 'facturacion', label: 'Facturación y RIPS', description: 'Facturación electrónica y generación de RIPS Res. 2275/2023' },
  { key: 'portal_paciente', label: 'Portal del Paciente', description: 'Acceso del paciente con OTP por SMS' },
  { key: 'notificaciones_sms', label: 'Notificaciones SMS', description: 'Recordatorios y alertas por SMS' },
  { key: 'notificaciones_whatsapp', label: 'Notificaciones WhatsApp', description: 'Mensajería vía WhatsApp (Twilio)' },
  { key: 'multisite', label: 'Multi-sede', description: 'Gestión de múltiples sedes clínicas' },
]

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        tradeName: true,
        nit: true,
        phone: true,
        email: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        isActive: true,
        createdAt: true,
        _count: { select: { users: true, sites: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        sites: { select: { id: true, name: true, city: true, isMain: true, isActive: true } },
        _count: { select: { users: true } },
      },
    })
    if (!tenant) throw new NotFoundException('Tenant no encontrado')
    return tenant
  }

  async create(dto: CreateTenantDto) {
    const exists = await this.prisma.tenant.findUnique({ where: { nit: dto.nit } })
    if (exists) throw new ConflictException('Ya existe un tenant con ese NIT')

    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        nit: dto.nit,
        tradeName: dto.tradeName,
        legalRepName: dto.legalRepName,
        phone: dto.phone,
        email: dto.email,
        subscriptionPlan: dto.subscriptionPlan ?? 'starter',
        subscriptionStatus: dto.subscriptionStatus ?? 'trial',
        timezone: dto.timezone ?? 'America/Bogota',
        isActive: true,
      },
    })
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id)

    if (dto.nit) {
      const conflict = await this.prisma.tenant.findFirst({ where: { nit: dto.nit, NOT: { id } } })
      if (conflict) throw new ConflictException('Ya existe otro tenant con ese NIT')
    }

    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.tradeName !== undefined && { tradeName: dto.tradeName }),
        ...(dto.nit && { nit: dto.nit }),
        ...(dto.legalRepName !== undefined && { legalRepName: dto.legalRepName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.subscriptionPlan && { subscriptionPlan: dto.subscriptionPlan }),
        ...(dto.subscriptionStatus && { subscriptionStatus: dto.subscriptionStatus }),
        ...(dto.timezone && { timezone: dto.timezone }),
      },
    })
  }

  async getFeatures(tenantId: string) {
    await this.findOne(tenantId)

    const dbRecords = await this.prisma.tenantFeature.findMany({
      where: { tenantId },
    })

    const dbMap = new Map(dbRecords.map((r) => [r.featureKey, r]))

    return FEATURES.map((f) => {
      const record = dbMap.get(f.key)
      return {
        key: f.key,
        label: f.label,
        description: f.description,
        isEnabled: record?.isEnabled ?? false,
        config: record?.config ?? {},
        enabledAt: record?.enabledAt ?? null,
      }
    })
  }

  async setFeature(tenantId: string, featureKey: string, isEnabled: boolean) {
    await this.findOne(tenantId)

    return this.prisma.tenantFeature.upsert({
      where: { tenantId_featureKey: { tenantId, featureKey } },
      create: {
        tenantId,
        featureKey,
        isEnabled,
        config: {},
        enabledAt: isEnabled ? new Date() : null,
      },
      update: {
        isEnabled,
        enabledAt: isEnabled ? new Date() : null,
      },
    })
  }

  async getTenantUsers(tenantId: string) {
    await this.findOne(tenantId)

    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        roles: { select: { role: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getTenantSites(tenantId: string) {
    await this.findOne(tenantId)

    return this.prisma.tenantSite.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        isMain: true,
        isActive: true,
      },
      orderBy: { isMain: 'desc' },
    })
  }
}
