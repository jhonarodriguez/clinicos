import { IsUUID, IsDateString, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class GetSlotsDto {
  @ApiProperty({ description: 'ID del profesional' })
  @IsUUID()
  professionalId!: string

  @ApiProperty({ description: 'ID del tipo de servicio' })
  @IsUUID()
  serviceTypeId!: string

  @ApiProperty({ description: 'ID de la sede' })
  @IsUUID()
  siteId!: string

  @ApiProperty({ description: 'Fecha a consultar (YYYY-MM-DD)' })
  @IsDateString()
  date!: string

  @ApiPropertyOptional({ description: 'ID del consultorio específico (filtra disponibilidad del recurso)' })
  @IsOptional()
  @IsUUID()
  roomId?: string
}
