'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Clock, CheckCircle2 } from 'lucide-react'
import { http, HttpError } from '@/lib/http'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServiceType {
  id: string
  name: string
  code?: string
  cupsCode?: string
  category: string
  defaultDurationMin: number
  recoveryDurationMin: number
  cleanupDurationMin: number
  requiresSedation: boolean
  requiresCompanion: boolean
  requiresAuthorization: boolean
  requiresConsent: boolean
  canSelfSchedule: boolean
  isActive: boolean
}

interface ServiceTypePayload {
  name: string
  code?: string
  cupsCode?: string
  category: string
  defaultDurationMin: number
  recoveryDurationMin?: number
  cleanupDurationMin?: number
  requiresSedation?: boolean
  requiresCompanion?: boolean
  requiresAuthorization?: boolean
  requiresConsent?: boolean
  canSelfSchedule?: boolean
}

const CATEGORIES = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'surgery', label: 'Cirugía' },
  { value: 'diagnostic', label: 'Diagnóstico' },
  { value: 'therapy', label: 'Terapia' },
  { value: 'endoscopy', label: 'Endoscopia' },
  { value: 'other', label: 'Otro' },
]

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
)

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition'
const selectCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-blue-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function ServiceModal({
  initial,
  onClose,
  onSave,
  loading,
  error,
}: {
  initial?: ServiceType
  onClose: () => void
  onSave: (data: ServiceTypePayload) => void
  loading: boolean
  error: string | null
}) {
  const [form, setForm] = useState<ServiceTypePayload>({
    name: initial?.name ?? '',
    code: initial?.code ?? '',
    cupsCode: initial?.cupsCode ?? '',
    category: initial?.category ?? 'consultation',
    defaultDurationMin: initial?.defaultDurationMin ?? 30,
    recoveryDurationMin: initial?.recoveryDurationMin ?? 0,
    cleanupDurationMin: initial?.cleanupDurationMin ?? 0,
    requiresSedation: initial?.requiresSedation ?? false,
    requiresCompanion: initial?.requiresCompanion ?? false,
    requiresAuthorization: initial?.requiresAuthorization ?? false,
    requiresConsent: initial?.requiresConsent ?? false,
    canSelfSchedule: initial?.canSelfSchedule ?? false,
  })

  const set = (key: keyof ServiceTypePayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const setNum = (key: keyof ServiceTypePayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: parseInt(e.target.value) || 0 }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      ...form,
      code: form.code || undefined,
      cupsCode: form.cupsCode || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {initial ? 'Editar servicio' : 'Nuevo tipo de servicio'}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <Field label="Nombre del servicio" required>
            <input className={inputCls} value={form.name} onChange={set('name')} required />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Categoría" required>
              <select className={selectCls} value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Código interno">
              <input className={inputCls} placeholder="COL-DX" value={form.code} onChange={set('code')} />
            </Field>
            <Field label="Código CUPS">
              <input className={inputCls} placeholder="895204" maxLength={6} value={form.cupsCode} onChange={set('cupsCode')} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Duración (min)" required>
              <input type="number" min={1} className={inputCls} value={form.defaultDurationMin} onChange={setNum('defaultDurationMin')} />
            </Field>
            <Field label="Recuperación (min)">
              <input type="number" min={0} className={inputCls} value={form.recoveryDurationMin} onChange={setNum('recoveryDurationMin')} />
            </Field>
            <Field label="Limpieza (min)">
              <input type="number" min={0} className={inputCls} value={form.cleanupDurationMin} onChange={setNum('cleanupDurationMin')} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Toggle label="Requiere sedación" checked={!!form.requiresSedation} onChange={(v) => setForm((f) => ({ ...f, requiresSedation: v }))} />
            <Toggle label="Requiere acompañante" checked={!!form.requiresCompanion} onChange={(v) => setForm((f) => ({ ...f, requiresCompanion: v }))} />
            <Toggle label="Requiere autorización" checked={!!form.requiresAuthorization} onChange={(v) => setForm((f) => ({ ...f, requiresAuthorization: v }))} />
            <Toggle label="Requiere consentimiento" checked={!!form.requiresConsent} onChange={(v) => setForm((f) => ({ ...f, requiresConsent: v }))} />
            <Toggle label="Permite auto-agendamiento" checked={!!form.canSelfSchedule} onChange={(v) => setForm((f) => ({ ...f, canSelfSchedule: v }))} />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ServicesClient() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; service?: ServiceType }>({ open: false })
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['service-types'],
    queryFn: () => http.get<ServiceType[]>('/service-types'),
  })

  const createMutation = useMutation({
    mutationFn: (payload: ServiceTypePayload) => http.post<ServiceType>('/service-types', payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['service-types'] }); setModal({ open: false }); setApiError(null) },
    onError: (err) => setApiError(err instanceof HttpError ? err.message : 'Error al crear servicio'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ServiceTypePayload> }) =>
      http.patch<ServiceType>(`/service-types/${id}`, payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['service-types'] }); setModal({ open: false }); setApiError(null) },
    onError: (err) => setApiError(err instanceof HttpError ? err.message : 'Error al actualizar servicio'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => http.delete<{ message: string }>(`/service-types/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['service-types'] }),
  })

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tipos de Servicio</h1>
          <p className="mt-0.5 text-sm text-slate-500">Catálogo de procedimientos y consultas</p>
        </div>
        <button
          onClick={() => { setApiError(null); setModal({ open: true }) }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo servicio
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">Cargando servicios...</div>
        ) : services.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">No hay tipos de servicio registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Categoría</th>
                  <th className="px-4 py-3 hidden md:table-cell">Duración total</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Requerimientos</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {services.map((s) => {
                  const totalMin = s.defaultDurationMin + s.recoveryDurationMin + s.cleanupDurationMin
                  const flags = [
                    s.requiresSedation && 'Sedación',
                    s.requiresCompanion && 'Acompañante',
                    s.requiresAuthorization && 'Autorización',
                    s.requiresConsent && 'Consentimiento',
                  ].filter(Boolean) as string[]

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{s.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          {s.code && <span className="text-[11px] text-slate-400">{s.code}</span>}
                          {s.cupsCode && <span className="text-[11px] text-slate-400">CUPS: {s.cupsCode}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                          {CATEGORY_LABELS[s.category] ?? s.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {totalMin} min
                          {s.recoveryDurationMin > 0 && (
                            <span className="text-slate-400">(+{s.recoveryDurationMin} rec.)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {flags.length > 0 ? (
                            flags.map((f) => (
                              <span key={f} className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                {f}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">Ninguno</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setApiError(null); setModal({ open: true, service: s }) }}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(s.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <ServiceModal
          initial={modal.service}
          onClose={() => { setModal({ open: false }); setApiError(null) }}
          onSave={(data) => {
            if (modal.service) {
              updateMutation.mutate({ id: modal.service.id, payload: data })
            } else {
              createMutation.mutate(data)
            }
          }}
          loading={createMutation.isPending || updateMutation.isPending}
          error={apiError}
        />
      )}
    </main>
  )
}
