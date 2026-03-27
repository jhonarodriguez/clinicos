import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

const STATUSES = ['scheduled', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show']

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsString()
  @IsIn(STATUSES)
  status?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  actualStart?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  actualEnd?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  arrivalAt?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancellationReason?: string

  @ApiPropertyOptional({ description: 'Quién cancela: patient | staff' })
  @IsOptional()
  @IsString()
  @IsIn(['patient', 'staff'])
  cancelledBy?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorizationNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomId?: string
}
