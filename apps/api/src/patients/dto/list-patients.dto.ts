import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'

export class ListPatientsDto {
  @ApiPropertyOptional({ description: 'Buscar por nombre, apellido, documento o teléfono' })
  @IsOptional() @IsString()
  search?: string

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'false' ? false : value === 'true' ? true : value)
  @IsBoolean()
  isActive?: boolean
}
