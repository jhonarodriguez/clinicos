import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { JwtPayload } from '../../common/decorators/current-user.decorator'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  roles: { select: { role: { select: { id: true, name: true } } } },
} as const

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: USER_SELECT,
    })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    return user
  }

  async create(dto: CreateUserDto, requester: JwtPayload) {
    const exists = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId: requester.tenantId, deletedAt: null },
    })
    if (exists) throw new ConflictException('El email ya está registrado en este tenant')

    const passwordHash = await bcrypt.hash(dto.password, 12)

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        tenantId: requester.tenantId,
        ...(dto.roleIds?.length
          ? { roles: { create: dto.roleIds.map((roleId) => ({ roleId, tenantId: requester.tenantId })) } }
          : {}),
      },
      select: USER_SELECT,
    })
  }

  async update(id: string, dto: UpdateUserDto, tenantId: string) {
    await this.findOne(id, tenantId)
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      select: USER_SELECT,
    })
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId)
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    })
    return { message: 'Usuario eliminado' }
  }
}
