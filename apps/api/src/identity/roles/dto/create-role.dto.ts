import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MinLength } from 'class-validator'

export class CreateRoleDto {
  @ApiProperty({ example: 'Enfermero' })
  @IsString()
  @MinLength(2)
  name!: string

  @ApiPropertyOptional({ example: 'Personal de enfermería' })
  @IsOptional()
  @IsString()
  description?: string
}
