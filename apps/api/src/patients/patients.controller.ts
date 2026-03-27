import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PatientsService } from './patients.service'
import { CreatePatientDto } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { ListPatientsDto } from './dto/list-patients.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pacientes del tenant' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: ListPatientsDto) {
    return this.service.findAll(tenantId, query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener paciente por ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.findOne(id, tenantId)
  }

  @Post()
  @ApiOperation({ summary: 'Crear paciente' })
  create(@Body() dto: CreatePatientDto, @CurrentUser('tenantId') tenantId: string) {
    return this.service.create(dto, tenantId)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar paciente' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.update(id, dto, tenantId)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar paciente (soft delete)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.remove(id, tenantId)
  }
}
