import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SuperAdminGuard } from '../../common/guards/super-admin.guard'
import { TenantsService } from './tenants.service'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { UpdateTenantDto } from './dto/update-tenant.dto'
import { ToggleFeatureDto } from './dto/toggle-feature.dto'

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenants: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los tenants (superadmin)' })
  findAll() {
    return this.tenants.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tenant por ID' })
  findOne(@Param('id') id: string) {
    return this.tenants.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo tenant' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenants.create(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tenant' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenants.update(id, dto)
  }

  @Get(':id/features')
  @ApiOperation({ summary: 'Listar features del tenant con estado de habilitación' })
  getFeatures(@Param('id') id: string) {
    return this.tenants.getFeatures(id)
  }

  @Post(':id/features/:featureKey/toggle')
  @ApiOperation({ summary: 'Habilitar o deshabilitar una feature del tenant' })
  setFeature(
    @Param('id') id: string,
    @Param('featureKey') featureKey: string,
    @Body() dto: ToggleFeatureDto,
  ) {
    return this.tenants.setFeature(id, featureKey, dto.isEnabled)
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Listar usuarios del tenant' })
  getTenantUsers(@Param('id') id: string) {
    return this.tenants.getTenantUsers(id)
  }

  @Get(':id/sites')
  @ApiOperation({ summary: 'Listar sedes del tenant' })
  getTenantSites(@Param('id') id: string) {
    return this.tenants.getTenantSites(id)
  }
}
