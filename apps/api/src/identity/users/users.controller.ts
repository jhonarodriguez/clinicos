import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios del tenant' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.users.findAll(user.tenantId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.users.findOne(id, user.tenantId)
  }

  @Post()
  @ApiOperation({ summary: 'Crear usuario en el tenant' })
  create(@Body() dto: CreateUserDto, @CurrentUser() requester: JwtPayload) {
    return this.users.create(dto, requester)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: JwtPayload) {
    return this.users.update(id, dto, user.tenantId)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.users.remove(id, user.tenantId)
  }
}
