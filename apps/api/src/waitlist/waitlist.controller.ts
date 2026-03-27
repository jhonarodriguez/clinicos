import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { WaitlistService } from './waitlist.service'
import { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto'
import { UpdateWaitlistEntryDto } from './dto/update-waitlist-entry.dto'
import { ListWaitlistDto } from './dto/list-waitlist.dto'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Waitlist')
@ApiBearerAuth()
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly service: WaitlistService) {}

  @Get()
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: ListWaitlistDto) {
    return this.service.findAll(query, tenantId)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.findOne(id, tenantId)
  }

  @Post()
  create(@Body() dto: CreateWaitlistEntryDto, @CurrentUser('tenantId') tenantId: string) {
    return this.service.create(dto, tenantId)
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWaitlistEntryDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.service.update(id, dto, tenantId)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('tenantId') tenantId: string) {
    return this.service.remove(id, tenantId)
  }
}
