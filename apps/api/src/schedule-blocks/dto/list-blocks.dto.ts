import { IsOptional, IsUUID, IsDateString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class ListBlocksDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  professionalId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  roomId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  equipmentId?: string

  @ApiPropertyOptional({ description: 'Filtrar bloques desde esta fecha (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({ description: 'Filtrar bloques hasta esta fecha (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string
}
