import { z } from 'zod'

export const CreateAppointmentSchema = z.object({
  patientId: z.string().uuid('ID de paciente inválido'),
  professionalId: z.string().uuid('ID de profesional inválido'),
  siteId: z.string().uuid('ID de sede inválido'),
  serviceTypeId: z.string().uuid('ID de tipo de servicio inválido'),
  specialtyId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
  scheduledStart: z.string().datetime('Fecha/hora de inicio inválida'),
  scheduledEnd: z.string().datetime('Fecha/hora de fin inválida'),
  isFirstVisit: z.boolean().default(false),
  authorizationNumber: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
  source: z.enum(['reception', 'web', 'phone', 'whatsapp']).default('reception'),
})

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial()

export const CancelAppointmentSchema = z.object({
  cancellationReason: z.string().min(5, 'Ingrese el motivo de cancelación').max(500),
})

export const RescheduleAppointmentSchema = z.object({
  scheduledStart: z.string().datetime('Fecha/hora de inicio inválida'),
  scheduledEnd: z.string().datetime('Fecha/hora de fin inválida'),
  reason: z.string().max(500).optional(),
})

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentSchema>
export type UpdateAppointmentDto = z.infer<typeof UpdateAppointmentSchema>
export type CancelAppointmentDto = z.infer<typeof CancelAppointmentSchema>
export type RescheduleAppointmentDto = z.infer<typeof RescheduleAppointmentSchema>
