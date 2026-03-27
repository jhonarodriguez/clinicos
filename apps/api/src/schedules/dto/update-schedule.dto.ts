import { PartialType, OmitType } from '@nestjs/swagger'
import { CreateScheduleDto } from './create-schedule.dto'

// professionalId y siteId son inmutables
export class UpdateScheduleDto extends PartialType(
  OmitType(CreateScheduleDto, ['professionalId', 'siteId'] as const),
) {}
