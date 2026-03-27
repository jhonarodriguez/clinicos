import { OmitType, PartialType } from '@nestjs/swagger'
import { CreateProfessionalDto } from './create-professional.dto'

export class UpdateProfessionalDto extends PartialType(
  OmitType(CreateProfessionalDto, ['userId', 'documentType', 'documentNumber', 'specialties'] as const),
) {}
