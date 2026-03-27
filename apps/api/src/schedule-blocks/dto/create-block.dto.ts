import { IsUUID, IsString, IsDateString, IsBoolean, IsOptional, IsIn } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

const BLOCK_TYPES = ['vacation', 'medical_leave', 'maintenance', 'administrative', 'personal', 'other']

export class CreateBlockDto {
  @ApiProperty({ enum: BLOCK_TYPES })
  @IsString()
  @IsIn(BLOCK_TYPES)
  blockType!: string

  @ApiPropertyOptional({ description: 'ID del profesional a bloquear' })
  @IsOptional()
  @IsUUID()
  professionalId?: string

  @ApiPropertyOptional({ description: 'ID del consultorio/sala a bloquear' })
  @IsOptional()
  @IsUUID()
  roomId?: string

  @ApiPropertyOptional({ description: 'ID del equipo a bloquear' })
  @IsOptional()
  @IsUUID()
  equipmentId?: string

  @ApiProperty({ description: 'Inicio del bloqueo (ISO 8601 con zona horaria)' })
  @IsDateString()
  startDatetime!: string

  @ApiProperty({ description: 'Fin del bloqueo (ISO 8601 con zona horaria)' })
  @IsDateString()
  endDatetime!: string

  @ApiPropertyOptional({ description: 'Bloquea todo el día', default: false })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean

  @ApiPropertyOptional({ description: 'Motivo del bloqueo' })
  @IsOptional()
  @IsString()
  reason?: string
}
