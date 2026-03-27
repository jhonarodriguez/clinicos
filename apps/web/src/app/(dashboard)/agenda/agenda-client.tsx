'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  X,
  Clock,
  MapPin,
  Stethoscope,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Site { id: string; name: string; isMain: boolean }

interface Professional {
  id: string
  user: { firstName: string; lastName: string }
}

interface ServiceType {
  id: string
  name: string
  defaultDurationMin: number
}

interface Patient {
  id: string
  firstName: string
  firstLastName: string
  documentNumber: string
}

interface TimeSlot {
  start: string
  end: string
  available: boolean
  bookedCount: number
  maxCapacity: number
  reason?: string
}

interface Appointment {
  id: string
  scheduledStart: string
  scheduledEnd: string
  status: string
  isFirstVisit: boolean
  notes?: string
  patient: { id: string; firstName: string; firstLastName: string; documentNumber: string }
  professional: { id: string; user: { firstName: string; lastName: string } }
  serviceType: { id: string; name: string; defaultDurationMin: number }
  specialty?: { id: string; name: string }
  room?: { id: string; name: string }
  site: { id: string; name: string }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  arrived: 'En espera',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-slate-100 text-slate-700',
  confirmed: 'bg-blue-50 text-blue-700',
  arrived: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-green-50 text-green-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
  no_show: 'bg-rose-50 text-rose-600',
}

const STATUS_BLOCK_COLORS: Record<string, { bg: string; border: string; title: string; sub: string }> = {
  scheduled: { bg: 'bg-slate-50', border: 'border-slate-200', title: 'text-slate-900', sub: 'text-slate-500' },
  confirmed: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-900', sub: 'text-blue-500' },
  arrived: { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-900', sub: 'text-amber-600' },
  in_progress: { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-900', sub: 'text-green-600' },
  completed: { bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'text-emerald-900', sub: 'text-emerald-600' },
  cancelled: { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-900', sub: 'text-red-400' },
  no_show: { bg: 'bg-rose-50', border: 'border-rose-200', title: 'text-rose-900', sub: 'text-rose-400' },
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// Grid: 07:00 to 19:00 in 30-min increments
const GRID_START = 7 * 60
const GRID_END   = 19 * 60
const SLOT_HEIGHT_PX = 48

function minutesFromMidnight(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

function gridTop(iso: string): number {
  return ((minutesFromMidnight(iso) - GRID_START) / 30) * SLOT_HEIGHT_PX
}

function gridHeight(startIso: string, endIso: string): number {
  const diffMin = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000
  return (diffMin / 30) * SLOT_HEIGHT_PX
}

const GRID_HOURS = Array.from({ length: (GRID_END - GRID_START) / 60 + 1 }, (_, i) => {
  const total = GRID_START + i * 60
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:00`
})

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  appt,
  onClose,
  onUpdated,
}: {
  appt: Appointment
  onClose: () => void
  onUpdated: () => void
}) {
  const qc = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (payload: object) => http.patch(`/appointments/${appt.id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      onUpdated()
    },
  })

  const label = STATUS_LABELS[appt.status] ?? appt.status
  const canConfirm  = appt.status === 'scheduled'
  const canArrive   = ['scheduled', 'confirmed'].includes(appt.status)
  const canStart    = ['confirmed', 'arrived'].includes(appt.status)
  const canComplete = appt.status === 'in_progress'
  const canCancel   = !['completed', 'cancelled', 'no_show'].includes(appt.status)

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">Detalle de cita</span>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{appt.patient.firstName} {appt.patient.firstLastName}</p>
            <p className="text-xs text-slate-500">CC {appt.patient.documentNumber}</p>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="space-y-2.5">
          {[
            { icon: Stethoscope, label: 'Servicio', value: appt.serviceType.name },
            { icon: User, label: 'Profesional', value: `${appt.professional.user.firstName} ${appt.professional.user.lastName}` },
            { icon: Clock, label: 'Hora', value: `${parseTime(appt.scheduledStart)} – ${parseTime(appt.scheduledEnd)}` },
            { icon: MapPin, label: 'Sede', value: appt.site.name },
          ].map(({ icon: Icon, label: l, value }) => (
            <div key={l} className="flex items-start gap-2 text-sm">
              <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1 flex justify-between">
                <span className="text-slate-400">{l}</span>
                <span className="font-medium text-slate-900 text-right max-w-[60%]">{value}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-slate-400 shrink-0" />
            <div className="flex-1 flex justify-between">
              <span className="text-slate-400">Estado</span>
              <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[appt.status]}`}>{label}</span>
            </div>
          </div>
          {appt.room && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="flex-1 flex justify-between">
                <span className="text-slate-400">Consultorio</span>
                <span className="font-medium text-slate-900">{appt.room.name}</span>
              </div>
            </div>
          )}
          {appt.isFirstVisit && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
              Primera visita del paciente
            </div>
          )}
        </div>

        {appt.notes && (
          <>
            <div className="h-px bg-slate-100" />
            <div className="space-y-1">
              <p className="text-xs text-slate-400">Notas</p>
              <p className="text-xs leading-relaxed text-slate-600">{appt.notes}</p>
            </div>
          </>
        )}

        {updateMutation.error && (
          <p className="text-xs text-red-600 bg-red-50 rounded p-2">
            {(updateMutation.error as Error).message}
          </p>
        )}
      </div>

      <div className="space-y-2 border-t border-slate-100 p-4">
        {canConfirm && (
          <button onClick={() => updateMutation.mutate({ status: 'confirmed' })} disabled={updateMutation.isPending}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
            Confirmar cita
          </button>
        )}
        {canArrive && (
          <button onClick={() => updateMutation.mutate({ status: 'arrived', arrivalAt: new Date().toISOString() })} disabled={updateMutation.isPending}
            className="w-full rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50">
            Registrar llegada
          </button>
        )}
        {canStart && (
          <button onClick={() => updateMutation.mutate({ status: 'in_progress', actualStart: new Date().toISOString() })} disabled={updateMutation.isPending}
            className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50">
            Iniciar consulta
          </button>
        )}
        {canComplete && (
          <button onClick={() => updateMutation.mutate({ status: 'completed', actualEnd: new Date().toISOString() })} disabled={updateMutation.isPending}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
            Completar consulta
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => {
              const reason = window.prompt('Motivo de cancelación:')
              if (!reason) return
              updateMutation.mutate({ status: 'cancelled', cancellationReason: reason, cancelledBy: 'staff' })
            }}
            disabled={updateMutation.isPending}
            className="w-full rounded-lg border border-slate-200 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
            Cancelar cita
          </button>
        )}
      </div>
    </div>
  )
}

// ─── New Appointment Modal ────────────────────────────────────────────────────

function NewAppointmentModal({
  defaultDate,
  onClose,
  onCreated,
}: {
  defaultDate: string
  onClose: () => void
  onCreated: () => void
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    patientSearch: '',
    patientId: '',
    patientLabel: '',
    professionalId: '',
    siteId: '',
    serviceTypeId: '',
    date: defaultDate,
    slotStart: '',
    notes: '',
    isFirstVisit: false,
    authorizationNumber: '',
  })
  const [error, setError] = useState('')
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: () => http.get<Site[]>('/sites'),
    staleTime: 60_000,
  })
  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ['professionals'],
    queryFn: () => http.get<Professional[]>('/professionals'),
    staleTime: 60_000,
  })
  const { data: serviceTypes = [] } = useQuery<ServiceType[]>({
    queryKey: ['service-types'],
    queryFn: () => http.get<ServiceType[]>('/service-types'),
    staleTime: 60_000,
  })
  const { data: patientResults = [] } = useQuery<Patient[]>({
    queryKey: ['patient-search', form.patientSearch],
    queryFn: () => http.get<Patient[]>(`/patients?search=${encodeURIComponent(form.patientSearch)}`),
    enabled: form.patientSearch.length >= 2,
    staleTime: 10_000,
  })

  const slotsEnabled = !!form.professionalId && !!form.serviceTypeId && !!form.siteId && !!form.date
  const { data: slots = [], isFetching: loadingSlots } = useQuery<TimeSlot[]>({
    queryKey: ['slots', form.professionalId, form.serviceTypeId, form.siteId, form.date],
    queryFn: () =>
      http.get<TimeSlot[]>(
        `/availability/slots?professionalId=${form.professionalId}&serviceTypeId=${form.serviceTypeId}&siteId=${form.siteId}&date=${form.date}`,
      ),
    enabled: slotsEnabled,
    staleTime: 0,
  })
  const availableSlots = slots.filter((s) => s.available)

  const createMutation = useMutation({
    mutationFn: (payload: object) => http.post('/appointments', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      onCreated()
      onClose()
    },
    onError: (e: Error) => setError(e.message),
  })

  function submit() {
    setError('')
    if (!form.patientId) return setError('Seleccione un paciente')
    if (!form.professionalId) return setError('Seleccione un profesional')
    if (!form.siteId) return setError('Seleccione una sede')
    if (!form.serviceTypeId) return setError('Seleccione un tipo de servicio')
    if (!form.slotStart) return setError('Seleccione un horario')
    createMutation.mutate({
      patientId: form.patientId,
      professionalId: form.professionalId,
      siteId: form.siteId,
      serviceTypeId: form.serviceTypeId,
      scheduledStart: form.slotStart,
      isFirstVisit: form.isFirstVisit,
      notes: form.notes || undefined,
      authorizationNumber: form.authorizationNumber || undefined,
      source: 'reception',
    })
  }

  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Nueva cita</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Paciente */}
          <div>
            <label className={labelCls}>Paciente *</label>
            {form.patientLabel ? (
              <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
                <span className="text-blue-900 font-medium">{form.patientLabel}</span>
                <button onClick={() => { set('patientId', ''); set('patientLabel', '') }} className="text-blue-400 hover:text-blue-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <input placeholder="Buscar por nombre o documento…" value={form.patientSearch}
                  onChange={(e) => set('patientSearch', e.target.value)} className={inputCls} />
                {patientResults.length > 0 && (
                  <div className="mt-1 rounded-lg border border-slate-200 bg-white shadow-md max-h-36 overflow-y-auto">
                    {patientResults.map((p) => (
                      <button key={p.id}
                        onClick={() => { set('patientId', p.id); set('patientLabel', `${p.firstName} ${p.firstLastName} · ${p.documentNumber}`); set('patientSearch', '') }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-900">{p.firstName} {p.firstLastName}</span>
                        <span className="text-slate-400 ml-2">{p.documentNumber}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Profesional *</label>
              <select value={form.professionalId} onChange={(e) => set('professionalId', e.target.value)} className={inputCls}>
                <option value="">Seleccionar…</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>{p.user.firstName} {p.user.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Sede *</label>
              <select value={form.siteId} onChange={(e) => set('siteId', e.target.value)} className={inputCls}>
                <option value="">Seleccionar…</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Tipo de servicio *</label>
            <select value={form.serviceTypeId} onChange={(e) => set('serviceTypeId', e.target.value)} className={inputCls}>
              <option value="">Seleccionar…</option>
              {serviceTypes.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.defaultDurationMin} min)</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Fecha *</label>
            <input type="date" value={form.date}
              onChange={(e) => { set('date', e.target.value); set('slotStart', '') }} className={inputCls} />
          </div>

          {slotsEnabled && (
            <div>
              <label className={labelCls}>
                Horario disponible *
                {loadingSlots && <span className="text-slate-400 ml-1">(cargando…)</span>}
              </label>
              {availableSlots.length === 0 && !loadingSlots ? (
                <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-3 text-center">
                  Sin slots disponibles. Verifique el horario del profesional.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
                  {availableSlots.map((slot) => {
                    const t = parseTime(slot.start)
                    const selected = form.slotStart === slot.start
                    return (
                      <button key={slot.start} onClick={() => set('slotStart', slot.start)}
                        className={`rounded-lg py-1.5 text-xs font-medium border transition-colors ${
                          selected ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}>
                        {t}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>No. Autorización</label>
              <input value={form.authorizationNumber} onChange={(e) => set('authorizationNumber', e.target.value)}
                placeholder="Opcional" className={inputCls} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={form.isFirstVisit}
                  onChange={(e) => set('isFirstVisit', e.target.checked)} className="rounded border-slate-300" />
                Primera visita
              </label>
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
              rows={2} className={`${inputCls} resize-none`} />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-5 py-4">
          <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={submit} disabled={createMutation.isPending}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
            {createMutation.isPending ? 'Guardando…' : 'Crear cita'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AgendaClient() {
  const qc = useQueryClient()

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [selectedProfId, setSelectedProfId] = useState('')
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)

  const dateStr = toDateStr(currentDate)

  function prevDay() { setCurrentDate((d) => { const n = new Date(d); n.setDate(d.getDate() - 1); return n }) }
  function nextDay() { setCurrentDate((d) => { const n = new Date(d); n.setDate(d.getDate() + 1); return n }) }
  function goToday() { setCurrentDate(new Date()) }

  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ['professionals'],
    queryFn: () => http.get<Professional[]>('/professionals'),
    staleTime: 60_000,
  })

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments', dateStr, selectedProfId],
    queryFn: () => {
      const params = new URLSearchParams({ startDate: dateStr, endDate: dateStr })
      if (selectedProfId) params.set('professionalId', selectedProfId)
      return http.get<Appointment[]>(`/appointments?${params}`)
    },
  })

  const visibleAppts = useMemo(
    () => appointments.filter((a) => {
      const m = minutesFromMidnight(a.scheduledStart)
      return m >= GRID_START && m < GRID_END
    }),
    [appointments],
  )

  const selectedAppt = appointments.find((a) => a.id === selectedApptId) ?? null

  function selectAppt(appt: Appointment) {
    setSelectedApptId(appt.id)
    setDetailOpen(true)
  }

  const gridTotalHeight = ((GRID_END - GRID_START) / 60) * SLOT_HEIGHT_PX * 2

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* ── Calendar panel ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 lg:px-4 lg:py-3">
          <div className="flex items-center gap-1.5">
            <button onClick={prevDay} className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={goToday} className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors capitalize">
              {formatDateLabel(currentDate)}
            </button>
            <button onClick={nextDay} className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select value={selectedProfId} onChange={(e) => setSelectedProfId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos los profesionales</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>{p.user.firstName} {p.user.lastName}</option>
              ))}
            </select>
            <button onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nueva cita</span>
            </button>
          </div>
        </div>

        {/* Time grid */}
        <div className="flex flex-1 overflow-y-auto">
          {/* Hour labels */}
          <div className="w-14 shrink-0 border-r border-slate-100 bg-slate-50 lg:w-16 relative">
            {GRID_HOURS.map((h, i) => (
              <div key={h} className="absolute left-0 right-0 flex items-center justify-center"
                style={{ top: i * SLOT_HEIGHT_PX * 2 - 8, height: 16 }}>
                <span className="text-[10px] text-slate-400 lg:text-[11px]">{h}</span>
              </div>
            ))}
            <div style={{ height: gridTotalHeight }} />
          </div>

          {/* Slots */}
          <div className="flex-1 relative" style={{ height: gridTotalHeight }}>
            {GRID_HOURS.map((h, i) => (
              <div key={h} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: i * SLOT_HEIGHT_PX * 2 }} />
            ))}
            {GRID_HOURS.slice(0, -1).map((h, i) => (
              <div key={`half-${h}`} className="absolute left-0 right-0 border-t border-dashed border-slate-50"
                style={{ top: i * SLOT_HEIGHT_PX * 2 + SLOT_HEIGHT_PX }} />
            ))}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <span className="text-xs text-slate-400">Cargando citas…</span>
              </div>
            )}

            {!isLoading && visibleAppts.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-8 w-8 text-slate-200" />
                <span className="text-sm text-slate-400">Sin citas este día</span>
                <button onClick={() => setShowNewModal(true)} className="mt-1 text-xs text-blue-600 hover:underline">
                  + Crear primera cita
                </button>
              </div>
            )}

            {visibleAppts.map((appt) => {
              const top = gridTop(appt.scheduledStart)
              const height = Math.max(gridHeight(appt.scheduledStart, appt.scheduledEnd), 32)
              const colors = STATUS_BLOCK_COLORS[appt.status] ?? STATUS_BLOCK_COLORS.scheduled!
              const isSelected = selectedAppt?.id === appt.id

              return (
                <button key={appt.id} onClick={() => selectAppt(appt)}
                  className={`absolute left-2 right-2 rounded-lg border px-2 py-1 text-left transition-all hover:shadow-md ${colors.bg} ${colors.border} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                  style={{ top, height }}>
                  <div className="flex items-start justify-between gap-1">
                    <span className={`text-xs font-semibold truncate leading-tight ${colors.title}`}>
                      {appt.patient.firstName} {appt.patient.firstLastName}
                    </span>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[appt.status]}`}>
                      {STATUS_LABELS[appt.status]}
                    </span>
                  </div>
                  {height > 36 && (
                    <span className={`text-[11px] ${colors.sub}`}>
                      {parseTime(appt.scheduledStart)} · {appt.serviceType.name}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Desktop detail panel */}
      {selectedAppt && (
        <aside className="hidden w-72 shrink-0 border-l border-slate-200 lg:flex lg:flex-col">
          <DetailPanel appt={selectedAppt} onClose={() => setSelectedApptId(null)}
            onUpdated={() => qc.invalidateQueries({ queryKey: ['appointments'] })} />
        </aside>
      )}

      {/* Mobile bottom drawer */}
      {selectedAppt && (
        <>
          <div className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden ${detailOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setDetailOpen(false)} />
          <div className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${detailOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex justify-center bg-white pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>
            <DetailPanel appt={selectedAppt} onClose={() => setDetailOpen(false)}
              onUpdated={() => qc.invalidateQueries({ queryKey: ['appointments'] })} />
          </div>
        </>
      )}

      {showNewModal && (
        <NewAppointmentModal defaultDate={dateStr} onClose={() => setShowNewModal(false)}
          onCreated={() => qc.invalidateQueries({ queryKey: ['appointments'] })} />
      )}
    </div>
  )
}
