import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { AssignPermissionDto } from './dto/assign-permission.dto'

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId, isActive: true },
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string, tenantId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        permissions: { include: { permission: true } },
      },
    })
    if (!role) throw new NotFoundException('Rol no encontrado')
    return role
  }

  async create(dto: CreateRoleDto, tenantId: string) {
    const exists = await this.prisma.role.findFirst({ where: { name: dto.name, tenantId } })
    if (exists) throw new ConflictException('Ya existe un rol con ese nombre en este tenant')

    return this.prisma.role.create({
      data: { name: dto.name, description: dto.description, tenantId },
    })
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
    })
  }

  async assignPermission(roleId: string, dto: AssignPermissionDto, tenantId: string) {
    await this.findOne(roleId, tenantId)

    const permission = await this.prisma.permission.findUnique({ where: { id: dto.permissionId } })
    if (!permission) throw new NotFoundException('Permiso no encontrado')

    const exists = await this.prisma.rolePermission.findFirst({
      where: { roleId, permissionId: dto.permissionId },
    })
    if (exists) throw new ConflictException('El rol ya tiene este permiso')

    return this.prisma.rolePermission.create({
      data: { roleId, permissionId: dto.permissionId },
    })
  }

  async removePermission(roleId: string, permissionId: string, tenantId: string) {
    await this.findOne(roleId, tenantId)

    const rp = await this.prisma.rolePermission.findFirst({ where: { roleId, permissionId } })
    if (!rp) throw new NotFoundException('El rol no tiene ese permiso')

    await this.prisma.rolePermission.delete({ where: { id: rp.id } })
    return { message: 'Permiso removido' }
  }
}
