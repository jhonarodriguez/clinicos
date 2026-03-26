import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator'

export class CreateTenantDto {
  @ApiProperty({ example: 'Gastromedicall Ltda' })
  @IsString()
  @MinLength(2)
  name!: string

  @ApiProperty({ example: '9001234567', description: 'NIT sin dígito de verificación' })
  @IsString()
  @Matches(/^\d{6,15}$/, { message: 'NIT debe contener solo dígitos (6-15)' })
  nit!: string

  @ApiPropertyOptional({ example: 'Gastromedicall' })
  @IsOptional()
  @IsString()
  tradeName?: string

  @ApiPropertyOptional({ example: 'Dr. Carlos Pérez' })
  @IsOptional()
  @IsString()
  legalRepName?: string

  @ApiPropertyOptional({ example: '+576012345678' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ example: 'contacto@gastromedicall.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: 'professional', description: 'starter | professional | enterprise | platform' })
  @IsOptional()
  @IsString()
  subscriptionPlan?: string

  @ApiPropertyOptional({ example: 'active', description: 'trial | active | suspended | cancelled' })
  @IsOptional()
  @IsString()
  subscriptionStatus?: string

  @ApiPropertyOptional({ example: 'America/Bogota' })
  @IsOptional()
  @IsString()
  timezone?: string
}
