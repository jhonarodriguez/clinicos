import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'medico@gastromedicall.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(8, { message: 'Mínimo 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Debe contener al menos una mayúscula' })
  @Matches(/[0-9]/, { message: 'Debe contener al menos un número' })
  password!: string

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MinLength(2)
  firstName!: string

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MinLength(2)
  lastName!: string

  @ApiPropertyOptional({ example: '+573001234567' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: 'IDs de roles a asignar' })
  @IsOptional()
  @IsString({ each: true })
  roleIds?: string[]
}
