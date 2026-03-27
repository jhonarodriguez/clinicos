'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight } from 'lucide-react'
import { http, HttpError } from '@/lib/http'

interface Tenant {
  id: string
  name: string
  tradeName: string | null
  nit: string
  phone: string | null
  email: string | null
  subscriptionPlan: string
  subscriptionStatus: string
  trialEndsAt: string | null
  isActive: boolean
  createdAt: string
  _count: { users: number; sites: number }
}

interface CreateTenantPayload {
  name: string
  nit: string
  subscriptionPlan?: string
  email?: string
  phone?: string
}

/* ── Badges ── */
const PLAN_BADGE: Record<string, string> = {
  starter: 'bg-slate-100 text-slate-600',
  professional: 'bg-blue-50 text-blue-700',
  enterprise: 'bg-purple-50 text-purple-700',
  platform: 'bg-slate-800 text-slate-100',
}

const STATUS_BADGE: Record<string, string> = {
  trial: 'bg-yellow-50 text-yellow-700',
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

function planLabel(plan: string) {
  return { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise', platform: 'Platform' }[plan] ?? plan
}

function statusLabel(status: string) {
  return { trial: 'Trial', active: 'Activo', suspended: 'Suspendido', cancelled: 'Cancelado' }[status] ?? status
}

/* ── Field ── */
function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
        {...props}
      />
    </div>
  )
}

/* ── CreateTenantModal ── */
function CreateTenantModal({ onClose, onSave }: { onClose: () => void; onSave: (data: CreateTenantPayload) => void }) {
  const [form, setForm] = useState({ name: '', nit: '', subscriptionPlan: 'starter', email: '', phone: '' })
  const [error, setError] = useState<string | null>(null)

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.nit) {
      setError('Nombre y NIT son obligatorios')
      return
    }
    onSave({
      name: form.name,
      nit: form.nit,
      subscriptionPlan: form.subscriptionPlan,
      email: form.email || undefined,
      phone: form.phone || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Nueva empresa</h2>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          <Field label="Nombre *" placeholder="Gastromedicall Ltda" {...field('name')} />
          <Field label="NIT *" placeholder="9001234567" {...field('nit')} />
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Plan</label>
            <select
              value={form.subscriptionPlan}
              onChange={(e) => setForm((f) => ({ ...f, subscriptionPlan: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
            >
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <Field label="Correo electrónico" type="email" placeholder="contacto@clinica.com" {...field('email')} />
          <Field label="Teléfono" placeholder="+576012345678" {...field('phone')} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
            >
              Crear empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main ── */
export function TenantsListClient() {
  const qc = useQueryClient()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => http.get<Tenant[]>('/tenants'),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateTenantPayload) => http.post<Tenant>('/tenants', payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tenants'] })
      setModalOpen(false)
      setApiError(null)
    },
    onError: (err) => {
      setApiError(err instanceof HttpError ? err.message : 'Error al crear empresa')
    },
  })

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Empresas</h1>
          <p className="mt-0.5 text-sm text-slate-500">Gestión de tenants de la plataforma</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva empresa
        </button>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            Cargando empresas...
          </div>
        ) : tenants.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            No hay empresas registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3 hidden sm:table-cell">NIT</th>
                  <th className="px-4 py-3 hidden md:table-cell">Plan</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 hidden lg:table-cell text-center">Sedes</th>
                  <th className="px-4 py-3 hidden lg:table-cell text-center">Usuarios</th>
                  <th className="px-4 py-3 hidden xl:table-cell">Creado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tenants.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => router.push(`/admin/tenants/${t.id}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/admin/tenants/${t.id}`) }}
                    role="button"
                    tabIndex={0}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{t.name}</p>
                        {t.tradeName && <p className="text-xs text-slate-500">{t.tradeName}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{t.nit}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${PLAN_BADGE[t.subscriptionPlan] ?? 'bg-slate-100 text-slate-600'}`}>
                        {planLabel(t.subscriptionPlan)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[t.subscriptionStatus] ?? 'bg-slate-100 text-slate-500'}`}>
                        {statusLabel(t.subscriptionStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-center text-slate-600">
                      {t._count.sites}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-center text-slate-600">
                      {t._count.users}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/tenants/${t.id}`) }}
                        className="flex items-center gap-1 ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Ver
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <CreateTenantModal
          onClose={() => { setModalOpen(false); setApiError(null) }}
          onSave={(data) => createMutation.mutate(data)}
        />
      )}
    </main>
  )
}
