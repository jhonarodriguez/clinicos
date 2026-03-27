import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString, IsOptional, IsInt, IsBoolean, IsIn, Min, Matches,
} from 'class-validator'

export const SERVICE_CATEGORIES = [
  'consultation', 'surgery', 'diagnostic', 'therapy', 'endoscopy', 'other',
] as const

export class CreateServiceTypeDto {
  @ApiProperty({ example: 'Colonoscopia diagnóstica' })
  @IsString()
  name!: string

  @ApiPropertyOptional({ example: 'COL-DX' })
  @IsOptional() @IsString()
  code?: string

  @ApiPropertyOptional({ example: '895204', description: 'Código CUPS' })
  @IsOptional()
  @Matches(/^[0-9]{6}$/, { message: 'cupsCode debe tener exactamente 6 dígitos' })
  cupsCode?: string

  @ApiProperty({ enum: SERVICE_CATEGORIES })
  @IsIn(SERVICE_CATEGORIES)
  category!: string

  @ApiProperty({ example: 45, description: 'Duración en minutos del procedimiento' })
  @IsInt() @Min(1)
  defaultDurationMin!: number

  @ApiPropertyOptional({ example: 30, default: 0 })
  @IsOptional() @IsInt() @Min(0)
  recoveryDurationMin?: number

  @ApiPropertyOptional({ example: 15, default: 0 })
  @IsOptional() @IsInt() @Min(0)
  cleanupDurationMin?: number

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  requiresSedation?: boolean

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  requiresCompanion?: boolean

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  requiresAuthorization?: boolean

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  requiresConsent?: boolean

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  canSelfSchedule?: boolean
}
