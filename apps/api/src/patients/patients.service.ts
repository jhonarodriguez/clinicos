import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePatientDto, DocumentType } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { ListPatientsDto } from './dto/list-patients.dto'

const PATIENT_SELECT = {
  id: true,
  tenantId: true,
  documentType: true,
  documentNumber: true,
  firstName: true,
  secondName: true,
  firstLastName: true,
  secondLastName: true,
  birthDate: true,
  biologicalSex: true,
  genderIdentity: true,
  bloodType: true,
  phone: true,
  phoneSecondary: true,
  email: true,
  address: true,
  municipalityCode: true,
  zone: true,
  occupation: true,
  payerType: true,
  payerId: true,
  payerName: true,
  affiliateType: true,
  emergencyContact: true,
  dataConsentSigned: true,
  dataConsentSignedAt: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

const DOC_RULES: Record<string, RegExp> = {
  CC:  /^[0-9]{8,10}$/,
  CE:  /^[a-zA-Z0-9]{6,10}$/,
  TI:  /^[0-9]{10,11}$/,
  PA:  /^[a-zA-Z0-9]{4,12}$/,
  RC:  /^[0-9]{10,11}$/,
  NIT: /^[0-9]{9}(-[0-9])?$/,
}

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  private validateDocument(type: DocumentType, number: string) {
    const rule = DOC_RULES[type]
    if (rule && !rule.test(number)) {
      throw new BadRequestException(`Número de documento inválido para tipo ${type}`)
    }
  }

  async findAll(tenantId: string, query: ListPatientsDto) {
    const isActive = query.isActive ?? true
    return this.prisma.patient.findMany({
      where: {
        tenantId,
        isActive,
        ...(query.search ? {
          OR: [
            { documentNumber: { contains: query.search } },
            { firstName: { contains: query.search, mode: 'insensitive' } },
            { firstLastName: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } },
          ],
        } : {}),
      },
      select: PATIENT_SELECT,
      orderBy: [{ firstLastName: 'asc' }, { firstName: 'asc' }],
    })
  }

  async findOne(id: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, tenantId },
      select: PATIENT_SELECT,
    })
    if (!patient) throw new NotFoundException('Paciente no encontrado')
    return patient
  }

  async create(dto: CreatePatientDto, tenantId: string) {
    this.validateDocument(dto.documentType, dto.documentNumber)

    const exists = await this.prisma.patient.findFirst({
      where: { tenantId, documentType: dto.documentType, documentNumber: dto.documentNumber },
    })
    if (exists) throw new ConflictException('Ya existe un paciente con ese documento en este tenant')

    return this.prisma.patient.create({
      data: {
        tenantId,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        firstName: dto.firstName,
        secondName: dto.secondName,
        firstLastName: dto.firstLastName,
        secondLastName: dto.secondLastName,
        birthDate: new Date(dto.birthDate),
        biologicalSex: dto.biologicalSex,
        genderIdentity: dto.genderIdentity,
        bloodType: dto.bloodType,
        phone: dto.phone,
        phoneSecondary: dto.phoneSecondary,
        email: dto.email,
        address: dto.address,
        municipalityCode: dto.municipalityCode,
        zone: dto.zone,
        occupation: dto.occupation,
        payerType: dto.payerType,
        payerId: dto.payerId,
        payerName: dto.payerName,
        affiliateType: dto.affiliateType,
        emergencyContact: dto.emergencyContact ? JSON.parse(JSON.stringify(dto.emergencyContact)) : undefined,
        dataConsentSigned: dto.dataConsentSigned ?? false,
        dataConsentSignedAt: dto.dataConsentSigned ? new Date() : null,
      },
      select: PATIENT_SELECT,
    })
  }

  async update(id: string, dto: UpdatePatientDto, tenantId: string) {
    await this.findOne(id, tenantId)
    return this.prisma.patient.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.secondName !== undefined && { secondName: dto.secondName }),
        ...(dto.firstLastName !== undefined && { firstLastName: dto.firstLastName }),
        ...(dto.secondLastName !== undefined && { secondLastName: dto.secondLastName }),
        ...(dto.birthDate !== undefined && { birthDate: new Date(dto.birthDate) }),
        ...(dto.biologicalSex !== undefined && { biologicalSex: dto.biologicalSex }),
        ...(dto.genderIdentity !== undefined && { genderIdentity: dto.genderIdentity }),
        ...(dto.bloodType !== undefined && { bloodType: dto.bloodType }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.phoneSecondary !== undefined && { phoneSecondary: dto.phoneSecondary }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.municipalityCode !== undefined && { municipalityCode: dto.municipalityCode }),
        ...(dto.zone !== undefined && { zone: dto.zone }),
        ...(dto.occupation !== undefined && { occupation: dto.occupation }),
        ...(dto.payerType !== undefined && { payerType: dto.payerType }),
        ...(dto.payerId !== undefined && { payerId: dto.payerId }),
        ...(dto.payerName !== undefined && { payerName: dto.payerName }),
        ...(dto.affiliateType !== undefined && { affiliateType: dto.affiliateType }),
        ...(dto.emergencyContact !== undefined && { emergencyContact: dto.emergencyContact ? JSON.parse(JSON.stringify(dto.emergencyContact)) : null }),
        ...(dto.dataConsentSigned !== undefined && {
          dataConsentSigned: dto.dataConsentSigned,
          dataConsentSignedAt: dto.dataConsentSigned ? new Date() : null,
        }),
      },
      select: PATIENT_SELECT,
    })
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId)
    await this.prisma.patient.update({ where: { id }, data: { isActive: false } })
    return { message: 'Paciente desactivado' }
  }
}
