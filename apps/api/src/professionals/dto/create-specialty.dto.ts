import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsOptional } from 'class-validator'

export class CreateSpecialtyDto {
  @ApiProperty({ example: 'Gastroenterología' })
  @IsString()
  name!: string

  @ApiPropertyOptional({ example: 'GAS' })
  @IsOptional() @IsString()
  code?: string

  @ApiPropertyOptional({ description: 'UUID de la especialidad padre (para subespecialidades)' })
  @IsOptional() @IsString()
  parentId?: string
}
