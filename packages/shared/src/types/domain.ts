// =============================================================================
// Tipos del dominio clínico
// =============================================================================

// ── Identity ──────────────────────────────────────────────────────────────────

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'trial' | 'active' | 'suspended' | 'cancelled'

// ── Scheduling ────────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled'

export type ProcedureStatus =
  | 'scheduled'
  | 'prep_sent'
  | 'prep_confirmed'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type AppointmentSource = 'reception' | 'web' | 'phone' | 'whatsapp'
export type CancellationBy = 'patient' | 'professional' | 'admin'

// ── Clinical ──────────────────────────────────────────────────────────────────

export type MedicalRecordType =
  | 'consultation'
  | 'procedure'
  | 'emergency'
  | 'follow_up'
  | 'interconsultation'

export type MedicalRecordStatus = 'in_progress' | 'signed' | 'amended'

export type DiagnosisType = 'principal' | 'related' | 'complication' | 'comorbidity'
export type DiagnosisConfirmation = 'confirmed' | 'presumptive' | 'differential' | 'ruled_out'

export type OrderType = 'lab' | 'imaging' | 'procedure' | 'interconsultation' | 'other'
export type OrderStatus = 'pending' | 'authorized' | 'completed' | 'cancelled'

export type SampleStatus = 'collected' | 'sent' | 'received' | 'processed' | 'reported'

// ── Billing ───────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'issued' | 'sent' | 'paid' | 'voided' | 'overdue'
export type ClaimStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'partial'
  | 'rejected'
  | 'appealed'

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'insurance' | 'copay'

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app'
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read'
export type NotificationType =
  | 'appointment_reminder'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'prep_instructions'
  | 'results_ready'
  | 'invoice_issued'
  | 'password_reset'
  | 'welcome'
