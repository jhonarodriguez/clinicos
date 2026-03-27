import { IsOptional, IsUUID, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class ListWaitlistDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  serviceTypeId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  patientId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  preferredProfessionalId?: string

  @ApiPropertyOptional({ description: 'Estado: waiting | notified | scheduled | expired | cancelled' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ description: 'Prioridad: urgent | high | normal | low' })
  @IsOptional()
  @IsString()
  priority?: string
}
