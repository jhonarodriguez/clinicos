import { Controller, Get, Post, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ScheduleBlocksService } from './schedule-blocks.service'
import { CreateBlockDto } from './dto/create-block.dto'
import { ListBlocksDto } from './dto/list-blocks.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Schedule Blocks')
@ApiBearerAuth()
@Controller('schedule-blocks')
export class ScheduleBlocksController {
  constructor(private readonly service: ScheduleBlocksService) {}

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: ListBlocksDto) {
    return this.service.findAll(query, tenantId)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId)
  }

  @Post()
  create(
    @Body() dto: CreateBlockDto,
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.create(dto, tenantId, userId)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId)
  }
}
