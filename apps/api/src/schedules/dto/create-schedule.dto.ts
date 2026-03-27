import {
  IsUUID,
  IsInt,
  IsDateString,
  IsBoolean,
  IsArray,
  IsOptional,
  Min,
  Max,
  IsString,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateScheduleDto {
  @ApiProperty({ description: 'ID del profesional' })
  @IsUUID()
  professionalId!: string

  @ApiProperty({ description: 'ID de la sede' })
  @IsUUID()
  siteId!: string

  @ApiProperty({ description: '0=Domingo, 1=Lunes … 6=Sábado', minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number

  @ApiProperty({ description: 'Hora inicio en formato HH:MM', example: '08:00' })
  @IsString()
  startTime!: string

  @ApiProperty({ description: 'Hora fin en formato HH:MM', example: '17:00' })
  @IsString()
  endTime!: string

  @ApiPropertyOptional({ description: 'Duración de cada slot en minutos', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(5)
  slotDurationMin?: number

  @ApiPropertyOptional({ description: 'Slots extra permitidos por overbooking', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxOverbooking?: number

  @ApiPropertyOptional({ description: 'UUIDs de tipos de servicio permitidos (vacío = todos)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  allowedServiceTypes?: string[]

  @ApiProperty({ description: 'Fecha inicio de vigencia (YYYY-MM-DD)' })
  @IsDateString()
  validFrom!: string

  @ApiPropertyOptional({ description: 'Fecha fin de vigencia (YYYY-MM-DD), null = indefinido' })
  @IsOptional()
  @IsDateString()
  validUntil?: string

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
