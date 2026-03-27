import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional, IsEnum, IsBoolean, ValidateNested, IsArray, ArrayMinSize } from 'class-validator'
import { Type } from 'class-transformer'
import { DocumentType } from '../../patients/dto/create-patient.dto'

class SpecialtyAssignmentDto {
  @IsString()
  specialtyId!: string

  @IsOptional() @IsBoolean()
  isPrimary?: boolean
}

export class CreateProfessionalDto {
  @ApiProperty({ description: 'UUID del usuario del sistema asociado al profesional' })
  @IsString()
  userId!: string

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  documentType!: DocumentType

  @ApiProperty({ example: '1234567890' })
  @IsString()
  documentNumber!: string

  @ApiPropertyOptional({ example: 'TP-12345', description: 'Tarjeta profesional' })
  @IsOptional() @IsString()
  professionalCard?: string

  @ApiPropertyOptional({ example: 'REG-001', description: 'Número de registro en entidad reguladora' })
  @IsOptional() @IsString()
  registrationNumber?: string

  @ApiPropertyOptional({ description: 'Especialidades asignadas al crear' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SpecialtyAssignmentDto)
  specialties?: SpecialtyAssignmentDto[]
}
