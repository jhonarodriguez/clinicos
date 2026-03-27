import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsIn, IsOptional, IsInt, IsBoolean, Min } from 'class-validator'

export const RESOURCE_TYPES = ['room_type', 'equipment_type', 'specialty'] as const

export class AddRequirementDto {
  @ApiProperty({ enum: RESOURCE_TYPES, description: 'Tipo de recurso requerido' })
  @IsIn(RESOURCE_TYPES)
  resourceType!: string

  @ApiProperty({ example: 'endoscopy', description: 'Valor del recurso (tipo de sala, tipo de equipo, código de especialidad)' })
  @IsString()
  resourceValue!: string

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional() @IsInt() @Min(1)
  quantity?: number

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isRequired?: boolean
}
