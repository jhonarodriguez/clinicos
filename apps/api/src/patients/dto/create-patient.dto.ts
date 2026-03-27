import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString, IsEnum, IsEmail, IsOptional, IsDateString,
  Matches, IsBoolean, IsIn, ValidateNested, IsObject,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum DocumentType {
  CC = 'CC',
  CE = 'CE',
  TI = 'TI',
  PA = 'PA',
  RC = 'RC',
  NIT = 'NIT',
}

export enum BiologicalSex {
  M = 'M',
  F = 'F',
  I = 'I',
}

class EmergencyContactDto {
  @IsString() name!: string
  @IsString() phone!: string
  @IsOptional() @IsString() relationship?: string
}

export class CreatePatientDto {
  @ApiProperty({ enum: DocumentType, description: 'Tipo de documento (CC, CE, TI, PA, RC, NIT)' })
  @IsEnum(DocumentType)
  documentType!: DocumentType

  @ApiProperty({ example: '1234567890' })
  @IsString()
  documentNumber!: string

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName!: string

  @ApiPropertyOptional({ example: 'Carlos' })
  @IsOptional() @IsString()
  secondName?: string

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  firstLastName!: string

  @ApiPropertyOptional({ example: 'García' })
  @IsOptional() @IsString()
  secondLastName?: string

  @ApiProperty({ example: '1990-05-15', description: 'Fecha de nacimiento (YYYY-MM-DD)' })
  @IsDateString()
  birthDate!: string

  @ApiProperty({ enum: BiologicalSex, description: 'M = Masculino, F = Femenino, I = Indeterminado' })
  @IsEnum(BiologicalSex)
  biologicalSex!: BiologicalSex

  @ApiPropertyOptional({ example: 'No binario' })
  @IsOptional() @IsString()
  genderIdentity?: string

  @ApiPropertyOptional({ example: 'O+', enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] })
  @IsOptional() @IsIn(['A+','A-','B+','B-','AB+','AB-','O+','O-'])
  bloodType?: string

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @Matches(/^(\+57)?[3][0-9]{9}$/, { message: 'Teléfono debe ser formato colombiano: 3XXXXXXXXX' })
  phone?: string

  @ApiPropertyOptional({ example: '3109876543' })
  @IsOptional()
  @Matches(/^(\+57)?[3][0-9]{9}$/, { message: 'Teléfono secundario debe ser formato colombiano' })
  phoneSecondary?: string

  @ApiPropertyOptional()
  @IsOptional() @IsEmail({}, { message: 'Email inválido' })
  email?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  address?: string

  @ApiPropertyOptional({ example: '11001', description: 'Código DIVIPOLA del municipio (5 dígitos)' })
  @IsOptional()
  @Matches(/^[0-9]{5}$/, { message: 'municipalityCode debe tener 5 dígitos (DIVIPOLA)' })
  municipalityCode?: string

  @ApiPropertyOptional({ enum: ['urbano', 'rural'] })
  @IsOptional() @IsIn(['urbano', 'rural'])
  zone?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  occupation?: string

  @ApiPropertyOptional({ enum: ['contributivo', 'subsidiado', 'vinculado', 'particular', 'otro'] })
  @IsOptional() @IsString()
  payerType?: string

  @ApiPropertyOptional({ description: 'UUID de la EPS/aseguradora' })
  @IsOptional() @IsString()
  payerId?: string

  @ApiPropertyOptional({ example: 'Sura EPS' })
  @IsOptional() @IsString()
  payerName?: string

  @ApiPropertyOptional({ enum: ['cotizante', 'beneficiario', 'independiente'] })
  @IsOptional() @IsString()
  affiliateType?: string

  @ApiPropertyOptional()
  @IsOptional() @IsObject() @ValidateNested() @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  dataConsentSigned?: boolean
}
