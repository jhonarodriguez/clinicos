'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/http'
import { Plus, X, Trash2, Calendar, Lock } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Site { id: string; name: string; isMain: boolean }
interface Professional { id: string; user: { firstName: string; lastName: string } }
interface ServiceType { id: string; name: string }

interface Schedule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDurationMin: number
  maxOverbooking: number
  allowedServiceTypes: string[]
  validFrom: string
  validUntil?: string
  isActive: boolean
  professional: { id: string; user: { firstName: string; lastName: string } }
  site: { id: string; name: string }
}

interface ScheduleBlock {
  id: string
  blockType: string
  startDatetime: string
  endDatetime: string
  allDay: boolean
  reason?: string
  professional?: { id: string; user: { firstName: string; lastName: string } }
  room?: { id: string; name: string }
  createdByUser: { firstName: string; lastName: string }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const BLOCK_TYPES: Record<string, string> = {
  vacation: 'Vacaciones',
  medical_leave: 'Incapacidad',
  maintenance: 'Mantenimiento',
  administrative: 'Administrativo',
  personal: 'Personal',
  other: 'Otro',
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

// ─── Schedule Modal ───────────────────────────────────────────────────────────

function ScheduleModal({
  professionals,
  sites,
  schedule,
  onClose,
  onSaved,
}: {
  professionals: Professional[]
  sites: Site[]
  schedule: Schedule | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!schedule
  const [form, setForm] = useState({
    professionalId: schedule?.professional.id ?? '',
    siteId: schedule?.site.id ?? '',
    dayOfWeek: schedule?.dayOfWeek ?? 1,
    startTime: schedule ? formatTime(schedule.startTime) : '08:00',
    endTime: schedule ? formatTime(schedule.endTime) : '17:00',
    slotDurationMin: schedule?.slotDurationMin ?? 20,
    maxOverbooking: schedule?.maxOverbooking ?? 0,
    validFrom: schedule?.validFrom?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    validUntil: schedule?.validUntil?.split('T')[0] ?? '',
    isActive: schedule?.isActive ?? true,
  })
  const [error, setError] = useState('')
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: (payload: object) =>
      isEdit
        ? http.patch(`/professional-schedules/${schedule!.id}`, payload)
        : http.post('/professional-schedules', payload),
    onSuccess: () => { onSaved(); onClose() },
    onError: (e: Error) => setError(e.message),
  })

  function submit() {
    setError('')
    if (!form.professionalId) return setError('Seleccione un profesional')
    if (!form.siteId) return setError('Seleccione una sede')
    mutation.mutate({
      ...(isEdit ? {} : { professionalId: form.professionalId, siteId: form.siteId }),
      dayOfWeek: Number(form.dayOfWeek),
      startTime: form.startTime,
      endTime: form.endTime,
      slotDurationMin: Number(form.slotDurationMin),
      maxOverbooking: Number(form.maxOverbooking),
      validFrom: form.validFrom,
      validUntil: form.validUntil || undefined,
      isActive: form.isActive,
    })
  }

  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{isEdit ? 'Editar horario' : 'Nuevo horario'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {!isEdit && (
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
          )}

          <div>
            <label className={labelCls}>Día de la semana *</label>
            <select value={form.dayOfWeek} onChange={(e) => set('dayOfWeek', e.target.value)} className={inputCls}>
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Hora inicio *</label>
              <input type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hora fin *</label>
              <input type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Duración slot (min) *</label>
              <input type="number" min={5} max={120} value={form.slotDurationMin}
                onChange={(e) => set('slotDurationMin', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Overbooking extra</label>
              <input type="number" min={0} max={10} value={form.maxOverbooking}
                onChange={(e) => set('maxOverbooking', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Vigente desde *</label>
              <input type="date" value={form.validFrom} onChange={(e) => set('validFrom', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Vigente hasta (vacío = indefinido)</label>
              <input type="date" value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} className={inputCls} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="rounded" />
            Horario activo
          </label>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-5 py-4">
          <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={submit} disabled={mutation.isPending}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Block Modal ──────────────────────────────────────────────────────────────

function BlockModal({
  professionals,
  onClose,
  onSaved,
}: {
  professionals: Professional[]
  onClose: () => void
  onSaved: () => void
}) {
  const today = new Date().toISOString().slice(0, 16)
  const [form, setForm] = useState({
    blockType: 'vacation',
    professionalId: '',
    startDatetime: today,
    endDatetime: today,
    allDay: false,
    reason: '',
  })
  const [error, setError] = useState('')
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: (payload: object) => http.post('/schedule-blocks', payload),
    onSuccess: () => { onSaved(); onClose() },
    onError: (e: Error) => setError(e.message),
  })

  function submit() {
    setError('')
    if (!form.professionalId) return setError('Seleccione un profesional')
    mutation.mutate({
      blockType: form.blockType,
      professionalId: form.professionalId || undefined,
      startDatetime: new Date(form.startDatetime).toISOString(),
      endDatetime: new Date(form.endDatetime).toISOString(),
      allDay: form.allDay,
      reason: form.reason || undefined,
    })
  }

  const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Nuevo bloqueo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tipo *</label>
              <select value={form.blockType} onChange={(e) => set('blockType', e.target.value)} className={inputCls}>
                {Object.entries(BLOCK_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Profesional *</label>
              <select value={form.professionalId} onChange={(e) => set('professionalId', e.target.value)} className={inputCls}>
                <option value="">Seleccionar…</option>
                {professionals.map((p) => (
                  <option key={p.id} value={p.id}>{p.user.firstName} {p.user.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Inicio *</label>
              <input type="datetime-local" value={form.startDatetime}
                onChange={(e) => set('startDatetime', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fin *</label>
              <input type="datetime-local" value={form.endDatetime}
                onChange={(e) => set('endDatetime', e.target.value)} className={inputCls} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={form.allDay}
              onChange={(e) => set('allDay', e.target.checked)} className="rounded" />
            Todo el día
          </label>

          <div>
            <label className={labelCls}>Motivo</label>
            <input value={form.reason} onChange={(e) => set('reason', e.target.value)}
              className={inputCls} placeholder="Opcional…" />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-5 py-4">
          <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={submit} disabled={mutation.isPending}
            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50">
            {mutation.isPending ? 'Guardando…' : 'Bloquear agenda'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SchedulesClient() {
  const qc = useQueryClient()

  const [tab, setTab] = useState<'schedules' | 'blocks'>('schedules')
  const [scheduleModal, setScheduleModal] = useState<{ open: boolean; item: Schedule | null }>({ open: false, item: null })
  const [blockModal, setBlockModal] = useState(false)
  const [filterProfId, setFilterProfId] = useState('')

  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ['professionals'],
    queryFn: () => http.get<Professional[]>('/professionals'),
    staleTime: 60_000,
  })
  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: () => http.get<Site[]>('/sites'),
    staleTime: 60_000,
  })

  const { data: schedules = [], isLoading: loadingSchedules } = useQuery<Schedule[]>({
    queryKey: ['professional-schedules', filterProfId],
    queryFn: () => {
      const params = filterProfId ? `?professionalId=${filterProfId}` : ''
      return http.get<Schedule[]>(`/professional-schedules${params}`)
    },
    enabled: tab === 'schedules',
  })

  const { data: blocks = [], isLoading: loadingBlocks } = useQuery<ScheduleBlock[]>({
    queryKey: ['schedule-blocks', filterProfId],
    queryFn: () => {
      const params = filterProfId ? `?professionalId=${filterProfId}` : ''
      return http.get<ScheduleBlock[]>(`/schedule-blocks${params}`)
    },
    enabled: tab === 'blocks',
  })

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => http.delete(`/professional-schedules/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professional-schedules'] }),
  })
  const deleteBlock = useMutation({
    mutationFn: (id: string) => http.delete(`/schedule-blocks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule-blocks'] }),
  })

  const tabCls = (t: string) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
    }`

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex gap-1">
          <button className={tabCls('schedules')} onClick={() => setTab('schedules')}>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Horarios</span>
          </button>
          <button className={tabCls('blocks')} onClick={() => setTab('blocks')}>
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" />Bloqueos</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select value={filterProfId} onChange={(e) => setFilterProfId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los profesionales</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>{p.user.firstName} {p.user.lastName}</option>
            ))}
          </select>
          <button
            onClick={() => tab === 'schedules' ? setScheduleModal({ open: true, item: null }) : setBlockModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            {tab === 'schedules' ? 'Nuevo horario' : 'Nuevo bloqueo'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Schedules */}
        {tab === 'schedules' && (
          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
            {loadingSchedules ? (
              <div className="flex items-center justify-center h-40 text-sm text-slate-400">Cargando…</div>
            ) : schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <Calendar className="h-8 w-8 text-slate-200" />
                <p className="text-sm text-slate-400">Sin horarios configurados</p>
                <button onClick={() => setScheduleModal({ open: true, item: null })} className="text-xs text-blue-600 hover:underline">
                  + Crear primer horario
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Profesional</th>
                    <th className="px-4 py-3 text-left">Sede</th>
                    <th className="px-4 py-3 text-left">Día</th>
                    <th className="px-4 py-3 text-left">Horario</th>
                    <th className="px-4 py-3 text-left">Slot</th>
                    <th className="px-4 py-3 text-left">Vigencia</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{s.professional.user.firstName} {s.professional.user.lastName}</td>
                      <td className="px-4 py-3 text-slate-600">{s.site.name}</td>
                      <td className="px-4 py-3 text-slate-600">{DAYS[s.dayOfWeek]}</td>
                      <td className="px-4 py-3 text-slate-600">{formatTime(s.startTime)} – {formatTime(s.endTime)}</td>
                      <td className="px-4 py-3 text-slate-600">{s.slotDurationMin} min</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {s.validFrom.split('T')[0]}{s.validUntil ? ` → ${s.validUntil.split('T')[0]}` : ' → ∞'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {s.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setScheduleModal({ open: true, item: s })}
                            className="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Calendar className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { if (confirm('¿Eliminar horario?')) deleteSchedule.mutate(s.id) }}
                            className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Blocks */}
        {tab === 'blocks' && (
          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
            {loadingBlocks ? (
              <div className="flex items-center justify-center h-40 text-sm text-slate-400">Cargando…</div>
            ) : blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <Lock className="h-8 w-8 text-slate-200" />
                <p className="text-sm text-slate-400">Sin bloqueos registrados</p>
                <button onClick={() => setBlockModal(true)} className="text-xs text-blue-600 hover:underline">+ Crear bloqueo</button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Profesional</th>
                    <th className="px-4 py-3 text-left">Inicio</th>
                    <th className="px-4 py-3 text-left">Fin</th>
                    <th className="px-4 py-3 text-left">Motivo</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {blocks.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <span className="rounded bg-red-50 text-red-700 px-2 py-0.5 text-[11px] font-medium">
                          {BLOCK_TYPES[b.blockType] ?? b.blockType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {b.professional ? `${b.professional.user.firstName} ${b.professional.user.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{formatDateTime(b.startDatetime)}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{formatDateTime(b.endDatetime)}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{b.reason ?? '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => { if (confirm('¿Eliminar bloqueo?')) deleteBlock.mutate(b.id) }}
                          className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {scheduleModal.open && (
        <ScheduleModal
          professionals={professionals}
          sites={sites}
          schedule={scheduleModal.item}
          onClose={() => setScheduleModal({ open: false, item: null })}
          onSaved={() => qc.invalidateQueries({ queryKey: ['professional-schedules'] })}
        />
      )}
      {blockModal && (
        <BlockModal
          professionals={professionals}
          onClose={() => setBlockModal(false)}
          onSaved={() => qc.invalidateQueries({ queryKey: ['schedule-blocks'] })}
        />
      )}
    </div>
  )
}
