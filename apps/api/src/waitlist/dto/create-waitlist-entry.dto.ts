import { IsUUID, IsString, IsOptional, IsDateString, IsIn } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

const PRIORITIES = ['urgent', 'high', 'normal', 'low']
const PREFERRED_TIMES = ['morning', 'afternoon', 'evening', 'any']

export class CreateWaitlistEntryDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string

  @ApiProperty()
  @IsUUID()
  serviceTypeId!: string

  @ApiPropertyOptional({ description: 'Preferencia de profesional' })
  @IsOptional()
  @IsUUID()
  preferredProfessionalId?: string

  @ApiPropertyOptional({ description: 'Preferencia de sede' })
  @IsOptional()
  @IsUUID()
  preferredSiteId?: string

  @ApiPropertyOptional({ description: 'Fecha mínima (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateRangeStart?: string

  @ApiPropertyOptional({ description: 'Fecha máxima (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateRangeEnd?: string

  @ApiPropertyOptional({ enum: PREFERRED_TIMES, default: 'any' })
  @IsOptional()
  @IsString()
  @IsIn(PREFERRED_TIMES)
  preferredTime?: string

  @ApiPropertyOptional({ enum: PRIORITIES, default: 'normal' })
  @IsOptional()
  @IsString()
  @IsIn(PRIORITIES)
  priority?: string
}
