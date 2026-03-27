import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { ProfessionalsService } from './professionals.service'
import { CreateProfessionalDto } from './dto/create-professional.dto'
import { UpdateProfessionalDto } from './dto/update-professional.dto'
import { CreateSpecialtyDto } from './dto/create-specialty.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Professionals')
@ApiBearerAuth()
@Controller()
export class ProfessionalsController {
  constructor(private readonly service: ProfessionalsService) {}

  // ── Specialties ────────────────────────────────────────────────────────────

  @Get('specialties')
  @ApiOperation({ summary: 'Listar especialidades disponibles para el tenant' })
  findAllSpecialties(@CurrentUser('tenantId') tenantId: string) {
    return this.service.findAllSpecialties(tenantId)
  }

  @Post('specialties')
  @ApiOperation({ summary: 'Crear especialidad personalizada para el tenant' })
  createSpecialty(@Body() dto: CreateSpecialtyDto, @CurrentUser('tenantId') tenantId: string) {
    return this.service.createSpecialty(dto, tenantId)
  }

  // ── Professionals ──────────────────────────────────────────────────────────

  @Get('professionals')
  @ApiOperation({ summary: 'Listar profesionales del tenant' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query('isActive') isActive?: string) {
    const active = isActive === 'false' ? false : true
    return this.service.findAll(tenantId, active)
  }

  @Get('professionals/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId)
  }

  @Post('professionals')
  @ApiOperation({ summary: 'Registrar profesional' })
  create(@Body() dto: CreateProfessionalDto, @CurrentUser('tenantId') tenantId: string) {
    return this.service.create(dto, tenantId)
  }

  @Patch('professionals/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfessionalDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.update(id, dto, tenantId)
  }

  @Delete('professionals/:id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId)
  }

  // ── Specialty assignments ──────────────────────────────────────────────────

  @Post('professionals/:id/specialties/:specialtyId')
  @ApiOperation({ summary: 'Asignar especialidad a profesional' })
  @ApiBody({
    schema: { type: 'object', properties: { isPrimary: { type: 'boolean', default: false } } },
    required: false,
  })
  assignSpecialty(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('specialtyId', ParseUUIDPipe) specialtyId: string,
    @Body('isPrimary') isPrimary = false,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.assignSpecialty(id, specialtyId, isPrimary, tenantId)
  }

  @Delete('professionals/:id/specialties/:specialtyId')
  @ApiOperation({ summary: 'Remover especialidad de profesional' })
  removeSpecialty(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('specialtyId', ParseUUIDPipe) specialtyId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.removeSpecialty(id, specialtyId, tenantId)
  }
}
