import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator'
import { RolesService } from './roles.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { AssignPermissionDto } from './dto/assign-permission.dto'

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private roles: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar roles del tenant con sus permisos' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.roles.findAll(user.tenantId)
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Listar todos los permisos disponibles (catálogo)' })
  findAllPermissions() {
    return this.roles.findAllPermissions()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.roles.findOne(id, user.tenantId)
  }

  @Post()
  @ApiOperation({ summary: 'Crear rol en el tenant' })
  create(@Body() dto: CreateRoleDto, @CurrentUser() user: JwtPayload) {
    return this.roles.create(dto, user.tenantId)
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Asignar permiso a un rol' })
  assignPermission(@Param('id') id: string, @Body() dto: AssignPermissionDto, @CurrentUser() user: JwtPayload) {
    return this.roles.assignPermission(id, dto, user.tenantId)
  }

  @Delete(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Remover permiso de un rol' })
  removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string, @CurrentUser() user: JwtPayload) {
    return this.roles.removePermission(id, permissionId, user.tenantId)
  }
}
