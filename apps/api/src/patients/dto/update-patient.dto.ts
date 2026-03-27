import { OmitType, PartialType } from '@nestjs/swagger'
import { CreatePatientDto } from './create-patient.dto'

// Documento de identidad es inmutable — no se puede cambiar en update
export class UpdatePatientDto extends PartialType(
  OmitType(CreatePatientDto, ['documentType', 'documentNumber'] as const),
) {}
