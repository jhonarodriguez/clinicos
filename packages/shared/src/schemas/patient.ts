import { z } from 'zod'

const DOCUMENT_TYPE_CODES = ['CC', 'CE', 'TI', 'RC', 'PA', 'MS', 'AS', 'PE', 'PT'] as const
const GENDER_CODES = ['M', 'F', 'I'] as const

// Validación de número de celular colombiano (10 dígitos, empieza en 3)
const colombianPhone = z
  .string()
  .regex(/^3\d{9}$/, 'Celular colombiano debe tener 10 dígitos y empezar en 3')
  .optional()
  .or(z.literal(''))

export const CreatePatientSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPE_CODES, {
    errorMap: () => ({ message: 'Tipo de documento inválido' }),
  }),
  documentNumber: z
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9\-]+$/, 'Solo letras, números y guiones'),
  firstName: z.string().min(2, 'Mínimo 2 caracteres').max(100).trim(),
  lastName: z.string().min(2, 'Mínimo 2 caracteres').max(100).trim(),
  dateOfBirth: z.string().date('Fecha inválida (YYYY-MM-DD)'),
  gender: z.enum(GENDER_CODES, {
    errorMap: () => ({ message: 'Género inválido' }),
  }),
  phone: colombianPhone,
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().max(300).optional(),
  municipalityCode: z.string().max(10).optional(),
  healthRegime: z
    .enum(['contributivo', 'subsidiado', 'especial', 'vinculado', 'particular'])
    .optional(),
  payerId: z.string().uuid('ID de aseguradora inválido').optional(),
  bloodType: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  allergies: z.array(z.string()).default([]),
  notes: z.string().max(2000).optional(),
})

export const UpdatePatientSchema = CreatePatientSchema.partial()

export type CreatePatientDto = z.infer<typeof CreatePatientSchema>
export type UpdatePatientDto = z.infer<typeof UpdatePatientSchema>
