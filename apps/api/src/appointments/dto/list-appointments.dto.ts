import { IsOptional, IsUUID, IsDateString, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class ListAppointmentsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  professionalId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  siteId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  serviceTypeId?: string

  @ApiPropertyOptional({ description: 'Filtrar desde esta fecha (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({ description: 'Filtrar hasta esta fecha (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({ description: 'Estado(s) separados por coma: scheduled,confirmed,arrived' })
  @IsOptional()
  @IsString()
  status?: string
}
