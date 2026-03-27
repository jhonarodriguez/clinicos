import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

const STATUSES = ['waiting', 'notified', 'scheduled', 'expired', 'cancelled']

export class UpdateWaitlistEntryDto {
  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsString()
  @IsIn(STATUSES)
  status?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(['urgent', 'high', 'normal', 'low'])
  priority?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  notifiedAt?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  notificationExpiresAt?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateRangeStart?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateRangeEnd?: string
}
