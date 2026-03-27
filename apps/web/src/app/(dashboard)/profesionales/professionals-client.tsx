'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Pencil, UserX, X, Stethoscope } from 'lucide-react'
import { http, HttpError } from '@/lib/http'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Specialty {
  id: string
  name: string
  code?: string
}

interface Professional {
  id: string
  documentType: string
  documentNumber: string
  professionalCard?: string
  registrationNumber?: string
  isActive: boolean
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  specialties: {
    id: string
    isPrimary: boolean
    specialty: { id: string; name: string; code?: string }
  }[]
}

interface CreateProfessionalPayload {
  userId: string
  documentType: string
  documentNumber: string
  professionalCard?: string
  registrationNumber?: string
}

const DOC_TYPES = ['CC', 'CE', 'TI', 'PA', 'NIT']

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

// ── Users selector (to link a professional) ───────────────────────────────────

interface SystemUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

// ── Create modal ──────────────────────────────────────────────────────────────

function ProfessionalModal({
  onClose,
  onSave,
  loading,
  error,
}: {
  onClose: () => void
  onSave: (data: CreateProfessionalPayload) => void
  loading: boolean
  error: string | null
}) {
  const [form, setForm] = useState<CreateProfessionalPayload>({
    userId: '',
    documentType: 'CC',
    documentNumber: '',
    professionalCard: '',
    registrationNumber: '',
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-professional'],
    queryFn: () => http.get<SystemUser[]>('/users'),
  })

  const set = (key: keyof CreateProfessionalPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      ...form,
      professionalCard: form.professionalCard || undefined,
      registrationNumber: form.registrationNumber || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Registrar profesional</h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <Field label="Usuario del sistema" required>
            <select className={selectCls} value={form.userId} onChange={set('userId')} required>
              <option value="">Seleccionar usuario...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} — {u.email}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Tipo doc." required>
              <select className={selectCls} value={form.documentType} onChange={set('documentType')}>
                {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Número de documento" required>
                <input className={inputCls} value={form.documentNumber} onChange={set('documentNumber')} required />
              </Field>
            </div>
          </div>

          <Field label="Tarjeta profesional">
            <input className={inputCls} placeholder="TP-XXXXX" value={form.professionalCard} onChange={set('professionalCard')} />
          </Field>

          <Field label="Número de registro">
            <input className={inputCls} placeholder="REG-001" value={form.registrationNumber} onChange={set('registrationNumber')} />
          </Field>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Specialties panel ─────────────────────────────────────────────────────────

function SpecialtiesPanel({
  professional,
  onClose,
}: {
  professional: Professional
  onClose: () => void
}) {
  const qc = useQueryClient()

  const { data: allSpecialties = [] } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => http.get<Specialty[]>('/specialties'),
  })

  const assignMutation = useMutation({
    mutationFn: (specialtyId: string) =>
      http.post(`/professionals/${professional.id}/specialties/${specialtyId}`, { isPrimary: false }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['professionals'] }),
  })

  const removeMutation = useMutation({
    mutationFn: (specialtyId: string) =>
      http.delete(`/professionals/${professional.id}/specialties/${specialtyId}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['professionals'] }),
  })

  const assignedIds = new Set(professional.specialties.map((s) => s.specialty.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Especialidades</h2>
            <p className="text-xs text-slate-500">
              {professional.user.firstName} {professional.user.lastName}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-4 space-y-1">
          {allSpecialties.map((s) => {
            const assigned = assignedIds.has(s.id)
            return (
              <div
                key={s.id}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  assigned ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                <span className={assigned ? 'font-medium text-blue-800' : 'text-slate-700'}>
                  {s.name}
                  {s.code && <span className="ml-2 text-xs text-slate-400">{s.code}</span>}
                </span>
                <button
                  onClick={() =>
                    assigned ? removeMutation.mutate(s.id) : assignMutation.mutate(s.id)
                  }
                  className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                    assigned
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {assigned ? 'Quitar' : 'Asignar'}
                </button>
              </div>
            )
          })}
        </div>
        <div className="border-t border-slate-100 px-6 py-3">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ProfessionalsClient() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [specialtiesFor, setSpecialtiesFor] = useState<Professional | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => http.get<Professional[]>('/professionals'),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateProfessionalPayload) =>
      http.post<Professional>('/professionals', payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['professionals'] })
      setModalOpen(false)
      setApiError(null)
    },
    onError: (err) => setApiError(err instanceof HttpError ? err.message : 'Error al registrar profesional'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => http.delete<{ message: string }>(`/professionals/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['professionals'] }),
  })

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Profesionales</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {professionals.length} profesional{professionals.length !== 1 ? 'es' : ''} registrado{professionals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setApiError(null); setModalOpen(true) }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Registrar profesional
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            Cargando profesionales...
          </div>
        ) : professionals.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-slate-400">
            <Stethoscope className="h-8 w-8 opacity-30" />
            No hay profesionales registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-3">Profesional</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Documento</th>
                  <th className="px-4 py-3 hidden md:table-cell">Tarjeta prof.</th>
                  <th className="px-4 py-3">Especialidades</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {professionals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                          {p.user.firstName[0]}{p.user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {p.user.firstName} {p.user.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{p.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {p.documentType}
                      </span>{' '}
                      <span className="text-slate-600">{p.documentNumber}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">
                      {p.professionalCard ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.specialties.length > 0 ? (
                          p.specialties.slice(0, 2).map((s) => (
                            <span
                              key={s.id}
                              className={`rounded px-2 py-0.5 text-[11px] ${
                                s.isPrimary
                                  ? 'bg-teal-100 text-teal-700 font-medium'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {s.specialty.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Sin especialidad</span>
                        )}
                        {p.specialties.length > 2 && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                            +{p.specialties.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSpecialtiesFor(p)}
                          className="rounded p-1.5 text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                          title="Gestionar especialidades"
                        >
                          <Stethoscope className="h-3.5 w-3.5" />
                        </button>
                        {p.isActive && (
                          <button
                            onClick={() => deactivateMutation.mutate(p.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Desactivar"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <ProfessionalModal
          onClose={() => { setModalOpen(false); setApiError(null) }}
          onSave={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
          error={apiError}
        />
      )}

      {specialtiesFor && (
        <SpecialtiesPanel
          professional={specialtiesFor}
          onClose={() => setSpecialtiesFor(null)}
        />
      )}
    </main>
  )
}
