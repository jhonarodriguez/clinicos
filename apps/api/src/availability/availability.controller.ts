import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AvailabilityService } from './availability.service'
import { GetSlotsDto } from './dto/get-slots.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Availability')
@ApiBearerAuth()
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly service: AvailabilityService) {}

  @Get('slots')
  @ApiOperation({
    summary: 'Obtener slots disponibles',
    description:
      'Retorna todos los slots del día para un profesional/servicio/sede. Incluye slots ocupados (available: false) para mostrar en la agenda.',
  })
  getSlots(@CurrentUser('tenantId') tenantId: string, @Query() query: GetSlotsDto) {
    return this.service.getSlots(query, tenantId)
  }
}
