import { IsOptional, IsUUID, IsInt, Min, Max, IsBooleanString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class ListSchedulesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  professionalId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  siteId?: string

  @ApiPropertyOptional({ minimum: 0, maximum: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBooleanString()
  isActive?: string
}
