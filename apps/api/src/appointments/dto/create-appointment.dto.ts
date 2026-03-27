import {
  IsUUID,
  IsDateString,
  IsBoolean,
  IsString,
  IsOptional,
  IsIn,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

const SOURCES = ['reception', 'phone', 'online', 'referral']

export class CreateAppointmentDto {
  @ApiProperty()
  @IsUUID()
  patientId!: string

  @ApiProperty()
  @IsUUID()
  professionalId!: string

  @ApiProperty()
  @IsUUID()
  siteId!: string

  @ApiProperty()
  @IsUUID()
  serviceTypeId!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  specialtyId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  roomId?: string

  @ApiProperty({ description: 'Inicio de la cita (ISO 8601 con zona horaria)' })
  @IsDateString()
  scheduledStart!: string

  @ApiPropertyOptional({ description: 'Si se omite se calcula con defaultDurationMin del tipo de servicio' })
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFirstVisit?: boolean

  @ApiPropertyOptional({ description: 'Número de autorización del asegurador' })
  @IsOptional()
  @IsString()
  authorizationNumber?: string

  @ApiPropertyOptional({ enum: SOURCES, default: 'reception' })
  @IsOptional()
  @IsString()
  @IsIn(SOURCES)
  source?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({ description: 'Forzar overbooking aunque no haya slot disponible', default: false })
  @IsOptional()
  @IsBoolean()
  forceOverbooking?: boolean
}
