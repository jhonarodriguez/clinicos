// =============================================================================
// Constantes del dominio clínico
// =============================================================================

import type {
  AppointmentStatus,
  ProcedureStatus,
  MedicalRecordStatus,
  InvoiceStatus,
  ClaimStatus,
} from '../types/domain'

// ── Etiquetas de estados ───────────────────────────────────────────────────────

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  arrived: 'En sala de espera',
  in_progress: 'En atención',
  completed: 'Atendida',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
  rescheduled: 'Reprogramada',
}

export const PROCEDURE_STATUS_LABELS: Record<ProcedureStatus, string> = {
  scheduled: 'Programado',
  prep_sent: 'Instrucciones enviadas',
  prep_confirmed: 'Preparación confirmada',
  arrived: 'Paciente en sala',
  in_progress: 'En procedimiento',
  completed: 'Completado',
  cancelled: 'Cancelado',
  no_show: 'No asistió',
}

export const MEDICAL_RECORD_STATUS_LABELS: Record<MedicalRecordStatus, string> = {
  in_progress: 'En proceso',
  signed: 'Firmado',
  amended: 'Enmendado',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Borrador',
  issued: 'Emitida',
  sent: 'Enviada',
  paid: 'Pagada',
  voided: 'Anulada',
  overdue: 'Vencida',
}

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  draft: 'Borrador',
  submitted: 'Radicada',
  in_review: 'En revisión',
  approved: 'Aprobada',
  partial: 'Aprobada parcial',
  rejected: 'Rechazada',
  appealed: 'En apelación',
}

// ── Colores de estado (para UI) ────────────────────────────────────────────────

export const APPOINTMENT_STATUS_COLOR: Record<AppointmentStatus, string> = {
  scheduled: 'blue',
  confirmed: 'cyan',
  arrived: 'yellow',
  in_progress: 'orange',
  completed: 'green',
  cancelled: 'red',
  no_show: 'gray',
  rescheduled: 'purple',
}

// ── Planes de suscripción ─────────────────────────────────────────────────────

export const SUBSCRIPTION_PLAN_LIMITS = {
  starter: {
    maxUsers: 5,
    maxSites: 1,
    maxProfessionals: 3,
    maxAppointmentsPerMonth: 500,
  },
  professional: {
    maxUsers: 20,
    maxSites: 3,
    maxProfessionals: 15,
    maxAppointmentsPerMonth: 3000,
  },
  enterprise: {
    maxUsers: null, // ilimitado
    maxSites: null,
    maxProfessionals: null,
    maxAppointmentsPerMonth: null,
  },
} as const

// ── Duración de slots (minutos) ────────────────────────────────────────────────

export const SLOT_DURATION_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120] as const

// ── Tipos de sala ─────────────────────────────────────────────────────────────

export const ROOM_TYPES = [
  { code: 'consultation', label: 'Consultorio' },
  { code: 'procedure', label: 'Sala de procedimientos' },
  { code: 'recovery', label: 'Sala de recuperación' },
  { code: 'waiting', label: 'Sala de espera' },
  { code: 'imaging', label: 'Sala de imágenes' },
] as const

// ── Días de la semana ─────────────────────────────────────────────────────────

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
] as const
