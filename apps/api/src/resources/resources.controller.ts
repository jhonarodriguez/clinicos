import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ResourcesService } from './resources.service'
import { CreateRoomDto } from './dto/create-room.dto'
import { UpdateRoomDto } from './dto/update-room.dto'
import { CreateEquipmentDto } from './dto/create-equipment.dto'
import { UpdateEquipmentDto } from './dto/update-equipment.dto'
import { ListResourcesDto } from './dto/list-resources.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Resources')
@ApiBearerAuth()
@Controller()
export class ResourcesController {
  constructor(private readonly service: ResourcesService) {}

  // ── Rooms ──────────────────────────────────────────────────────────────────

  @Get('rooms')
  @ApiOperation({ summary: 'Listar consultorios/salas' })
  findAllRooms(@CurrentUser('tenantId') tenantId: string, @Query() query: ListResourcesDto) {
    return this.service.findAllRooms(tenantId, query)
  }

  @Get('rooms/:id')
  findOneRoom(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOneRoom(id, tenantId)
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Crear consultorio/sala' })
  createRoom(@Body() dto: CreateRoomDto, @CurrentUser('tenantId') tenantId: string) {
    return this.service.createRoom(dto, tenantId)
  }

  @Patch('rooms/:id')
  updateRoom(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.updateRoom(id, dto, tenantId)
  }

  @Delete('rooms/:id')
  removeRoom(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.removeRoom(id, tenantId)
  }

  // ── Equipment ──────────────────────────────────────────────────────────────

  @Get('equipment')
  @ApiOperation({ summary: 'Listar equipos' })
  findAllEquipment(@CurrentUser('tenantId') tenantId: string, @Query() query: ListResourcesDto) {
    return this.service.findAllEquipment(tenantId, query)
  }

  @Get('equipment/:id')
  findOneEquipment(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOneEquipment(id, tenantId)
  }

  @Post('equipment')
  @ApiOperation({ summary: 'Registrar equipo' })
  createEquipment(@Body() dto: CreateEquipmentDto, @CurrentUser('tenantId') tenantId: string) {
    return this.service.createEquipment(dto, tenantId)
  }

  @Patch('equipment/:id')
  updateEquipment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEquipmentDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.updateEquipment(id, dto, tenantId)
  }

  @Delete('equipment/:id')
  removeEquipment(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.removeEquipment(id, tenantId)
  }
}
