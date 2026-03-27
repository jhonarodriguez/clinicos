import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { SchedulesService } from './schedules.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { ListSchedulesDto } from './dto/list-schedules.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Professional Schedules')
@ApiBearerAuth()
@Controller('professional-schedules')
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: ListSchedulesDto) {
    return this.service.findAll(query, tenantId)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId)
  }

  @Post()
  create(@Body() dto: CreateScheduleDto, @CurrentUser('tenantId') tenantId: string) {
    return this.service.create(dto, tenantId)
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.update(id, dto, tenantId)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId)
  }
}
