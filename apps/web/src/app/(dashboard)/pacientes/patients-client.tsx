'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Search, Pencil, UserX, UserCheck, X } from 'lucide-react'
import { http, HttpError } from '@/lib/http'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Patient {
  id: string
  documentType: string
  documentNumber: string
  firstName: string
  secondName?: string
  firstLastName: string
  secondLastName?: string
  birthDate: string
  biologicalSex: string
  phone?: string
  email?: string
  payerType?: string
  payerName?: string
  isActive: boolean
  createdAt: string
}

interface CreatePatientPayload {
  documentType: string
  documentNumber: string
  firstName: string
  secondName?: string
  firstLastName: string
  secondLastName?: string
  birthDate: string
  biologicalSex: string
  phone?: string
  email?: string
  address?: string
  municipalityCode?: string
  zone?: string
  payerType?: string
  payerName?: string
  affiliateType?: string
  dataConsentSigned?: boolean
}

const DOC_TYPES = ['CC', 'CE', 'TI', 'PA', 'RC', 'NIT']
const BIO_SEX = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'I', label: 'Indeterminado' },
]
const PAYER_TYPES = [
  { value: 'contributivo', label: 'Contributivo' },
  { value: 'subsidiado', label: 'Subsidiado' },
  { value: 'vinculado', label: 'Vinculado' },
  { value: 'particular', label: 'Particular' },
  { value: 'otro', label: 'Otro' },
]

// ── Form helpers ──────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition'
const selectCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white'

// ── Create / Edit modal ───────────────────────────────────────────────────────

function PatientModal({
  initial,
  onClose,
  onSave,
  loading,
  error,
}: {
  initial?: Partial<CreatePatientPayload>
  onClose: () => void
  onSave: (data: CreatePatientPayload) => void
  loading: boolean
  error: string | null
}) {
  const [form, setForm] = useState<CreatePatientPayload>({
    documentType: initial?.documentType ?? 'CC',
    documentNumber: initial?.documentNumber ?? '',
    firstName: initial?.firstName ?? '',
    secondName: initial?.secondName ?? '',
    firstLastName: initial?.firstLastName ?? '',
    secondLastName: initial?.secondLastName ?? '',
    birthDate: initial?.birthDate ? initial.birthDate.substring(0, 10) : '',
    biologicalSex: initial?.biologicalSex ?? 'M',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    address: initial?.address ?? '',
    payerType: initial?.payerType ?? '',
    payerName: initial?.payerName ?? '',
    affiliateType: initial?.affiliateType ?? '',
    dataConsentSigned: initial?.dataConsentSigned ?? false,
  })

  const set = (key: keyof CreatePatientPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload: CreatePatientPayload = {
      ...form,
      secondName: form.secondName || undefined,
      secondLastName: form.secondLastName || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
      payerType: form.payerType || undefined,
      payerName: form.payerName || undefined,
      affiliateType: form.affiliateType || undefined,
    }
    onSave(payload)
  }

  const isEdit = !!initial?.documentNumber

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? 'Editar paciente' : 'Nuevo paciente'}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Documento */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Identificación
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Tipo doc." required>
                <select className={selectCls} value={form.documentType} onChange={set('documentType')} disabled={isEdit}>
                  {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <div className="col-span-2">
                <Field label="Número de documento" required>
                  <input className={inputCls} value={form.documentNumber} onChange={set('documentNumber')} disabled={isEdit} />
                </Field>
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Nombre completo
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primer nombre" required>
                <input className={inputCls} value={form.firstName} onChange={set('firstName')} />
              </Field>
              <Field label="Segundo nombre">
                <input className={inputCls} value={form.secondName} onChange={set('secondName')} />
              </Field>
              <Field label="Primer apellido" required>
                <input className={inputCls} value={form.firstLastName} onChange={set('firstLastName')} />
              </Field>
              <Field label="Segundo apellido">
                <input className={inputCls} value={form.secondLastName} onChange={set('secondLastName')} />
              </Field>
            </div>
          </div>

          {/* Datos clínicos */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Datos clínicos
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha de nacimiento" required>
                <input type="date" className={inputCls} value={form.birthDate} onChange={set('birthDate')} />
              </Field>
              <Field label="Sexo biológico" required>
                <select className={selectCls} value={form.biologicalSex} onChange={set('biologicalSex')}>
                  {BIO_SEX.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contacto
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Teléfono">
                <input className={inputCls} placeholder="3XXXXXXXXX" value={form.phone} onChange={set('phone')} />
              </Field>
              <Field label="Correo electrónico">
                <input type="email" className={inputCls} value={form.email} onChange={set('email')} />
              </Field>
              <div className="col-span-2">
                <Field label="Dirección">
                  <input className={inputCls} value={form.address} onChange={set('address')} />
                </Field>
              </div>
            </div>
          </div>

          {/* Aseguramiento */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Aseguramiento
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Tipo de afiliación">
                <select className={selectCls} value={form.payerType} onChange={set('payerType')}>
                  <option value="">Sin régimen</option>
                  {PAYER_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>
              <div className="col-span-2">
                <Field label="EPS / Aseguradora">
                  <input className={inputCls} placeholder="Nombre de la EPS" value={form.payerName} onChange={set('payerName')} />
                </Field>
              </div>
            </div>
          </div>

          {/* Consentimiento */}
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={form.dataConsentSigned}
              onChange={(e) => setForm((f) => ({ ...f, dataConsentSigned: e.target.checked }))}
            />
            Consentimiento de datos firmado
          </label>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Age helper ────────────────────────────────────────────────────────────────

function calcAge(birthDate: string) {
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function PatientsClient() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; patient?: Patient }>({ open: false })
  const [apiError, setApiError] = useState<string | null>(null)

  // debounce 350ms
  const handleSearch = (value: string) => {
    setSearch(value)
    clearTimeout((handleSearch as { _t?: ReturnType<typeof setTimeout> })._t)
    ;(handleSearch as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => setDebouncedSearch(value), 350)
  }

  const params = new URLSearchParams()
  if (debouncedSearch) params.set('search', debouncedSearch)
  if (showInactive) params.set('isActive', 'false')

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', debouncedSearch, showInactive],
    queryFn: () => http.get<Patient[]>(`/patients?${params.toString()}`),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreatePatientPayload) => http.post<Patient>('/patients', payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['patients'] })
      setModal({ open: false })
      setApiError(null)
    },
    onError: (err) => setApiError(err instanceof HttpError ? err.message : 'Error al crear paciente'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreatePatientPayload> }) =>
      http.patch<Patient>(`/patients/${id}`, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['patients'] })
      setModal({ open: false })
      setApiError(null)
    },
    onError: (err) => setApiError(err instanceof HttpError ? err.message : 'Error al actualizar paciente'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active
        ? http.patch<Patient>(`/patients/${id}`, { isActive: false })
        : http.delete<{ message: string }>(`/patients/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['patients'] }),
  })

  function openCreate() {
    setApiError(null)
    setModal({ open: true })
  }

  function openEdit(p: Patient) {
    setApiError(null)
    setModal({ open: true, patient: p })
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Pacientes</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} {showInactive ? 'inactivos' : 'activos'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo paciente
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            placeholder="Buscar por nombre, documento o teléfono..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Ver inactivos
        </label>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            Cargando pacientes...
          </div>
        ) : patients.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            {debouncedSearch ? 'No se encontraron resultados' : 'No hay pacientes registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-3">Paciente</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Documento</th>
                  <th className="px-4 py-3 hidden md:table-cell">Edad</th>
                  <th className="px-4 py-3 hidden lg:table-cell">EPS</th>
                  <th className="px-4 py-3 hidden md:table-cell">Teléfono</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                          {p.firstName[0]}{p.firstLastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {p.firstLastName} {p.secondLastName} {p.firstName} {p.secondName}
                          </p>
                          <p className="text-xs text-slate-500">{p.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {p.documentType}
                      </span>{' '}
                      <span className="text-slate-600">{p.documentNumber}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                      {calcAge(p.birthDate)} años
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">
                      {p.payerName ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">
                      {p.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                          p.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate({ id: p.id, active: p.isActive })}
                          className={`rounded p-1.5 transition-colors ${
                            p.isActive
                              ? 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                              : 'text-slate-400 hover:bg-green-50 hover:text-green-600'
                          }`}
                          title={p.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {p.isActive ? (
                            <UserX className="h-3.5 w-3.5" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <PatientModal
          initial={
            modal.patient
              ? {
                  documentType: modal.patient.documentType,
                  documentNumber: modal.patient.documentNumber,
                  firstName: modal.patient.firstName,
                  secondName: modal.patient.secondName,
                  firstLastName: modal.patient.firstLastName,
                  secondLastName: modal.patient.secondLastName,
                  birthDate: modal.patient.birthDate,
                  biologicalSex: modal.patient.biologicalSex,
                  phone: modal.patient.phone,
                  email: modal.patient.email,
                  payerType: modal.patient.payerType,
                  payerName: modal.patient.payerName,
                }
              : undefined
          }
          onClose={() => { setModal({ open: false }); setApiError(null) }}
          onSave={(data) => {
            if (modal.patient) {
              // documentType y documentNumber son inmutables — no se envían en PATCH
              const { documentType: _dt, documentNumber: _dn, ...updatePayload } = data
              updateMutation.mutate({ id: modal.patient.id, payload: updatePayload })
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
