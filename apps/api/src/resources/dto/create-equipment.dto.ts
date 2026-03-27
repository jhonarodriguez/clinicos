import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator'

export const MAINTENANCE_STATUSES = ['operational', 'maintenance', 'out_of_service'] as const

export class CreateEquipmentDto {
  @ApiProperty({ example: 'uuid-del-site' })
  @IsString()
  siteId!: string

  @ApiProperty({ example: 'Endoscopio Olympus' })
  @IsString()
  name!: string

  @ApiPropertyOptional({ example: 'EQ-001' })
  @IsOptional() @IsString()
  code?: string

  @ApiProperty({ example: 'endoscope' })
  @IsString()
  equipmentType!: string

  @ApiPropertyOptional({ example: 'Olympus' })
  @IsOptional() @IsString()
  brand?: string

  @ApiPropertyOptional({ example: 'CV-190' })
  @IsOptional() @IsString()
  model?: string

  @ApiPropertyOptional({ example: 'SN-12345' })
  @IsOptional() @IsString()
  serialNumber?: string

  @ApiPropertyOptional({ description: 'UUID del consultorio donde está ubicado' })
  @IsOptional() @IsString()
  roomId?: string

  @ApiPropertyOptional({ enum: MAINTENANCE_STATUSES, default: 'operational' })
  @IsOptional() @IsIn(MAINTENANCE_STATUSES)
  maintenanceStatus?: string

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional() @IsDateString()
  lastMaintenanceAt?: string

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional() @IsDateString()
  nextMaintenanceAt?: string
}
