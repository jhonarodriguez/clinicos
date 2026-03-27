import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { ServiceTypesService } from './service-types.service'
import { CreateServiceTypeDto } from './dto/create-service-type.dto'
import { UpdateServiceTypeDto } from './dto/update-service-type.dto'
import { AddRequirementDto } from './dto/add-requirement.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Service Types')
@ApiBearerAuth()
@Controller('service-types')
export class ServiceTypesController {
  constructor(private readonly service: ServiceTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tipos de servicio' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query('isActive') isActive?: string) {
    const active = isActive === 'false' ? false : true
    return this.service.findAll(tenantId, active)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId)
  }

  @Post()
  @ApiOperation({ summary: 'Crear tipo de servicio' })
  create(@Body() dto: CreateServiceTypeDto, @CurrentUser('tenantId') tenantId: string) {
    return this.service.create(dto, tenantId)
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceTypeDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.update(id, dto, tenantId)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId)
  }

  // ── Requirements ──────────────────────────────────────────────────────────

  @Post(':id/requirements')
  @ApiOperation({ summary: 'Agregar requerimiento de recurso al tipo de servicio' })
  addRequirement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddRequirementDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.addRequirement(id, dto, tenantId)
  }

  @Delete(':id/requirements/:requirementId')
  @ApiOperation({ summary: 'Eliminar requerimiento de recurso' })
  removeRequirement(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('requirementId', ParseUUIDPipe) requirementId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.removeRequirement(id, requirementId, tenantId)
  }
}
