'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Copy, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react'
import { http, HttpError } from '@/lib/http'

/* ── Types ── */
interface Tenant {
  id: string
  name: string
  tradeName: string | null
  nit: string
  legalRepName: string | null
  phone: string | null
  email: string | null
  subscriptionPlan: string
  subscriptionStatus: string
  timezone: string
  isActive: boolean
  createdAt: string
  sites: Site[]
  _count: { users: number }
}

interface Feature {
  key: string
  label: string
  description: string
  isEnabled: boolean
  enabledAt: string | null
}

interface TenantUser {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  roles: { role: { id: string; name: string } }[]
}

interface Site {
  id: string
  name: string
  city: string | null
  address: string | null
  isMain: boolean
  isActive: boolean
}

/* ── Shared Field component ── */
function Field({
  label,
  readOnly,
  ...props
}: { label: string; readOnly?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        readOnly={readOnly}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
          readOnly
            ? 'border-slate-100 bg-slate-50 text-slate-500 cursor-default'
            : 'border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
        }`}
        {...props}
      />
    </div>
  )
}

/* ── Tab: Información ── */
function InfoTab({ tenant }: { tenant: Tenant }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: tenant.name,
    tradeName: tenant.tradeName ?? '',
    nit: tenant.nit,
    legalRepName: tenant.legalRepName ?? '',
    phone: tenant.phone ?? '',
    email: tenant.email ?? '',
    timezone: tenant.timezone,
    subscriptionPlan: tenant.subscriptionPlan,
    subscriptionStatus: tenant.subscriptionStatus,
  })
  const [copied, setCopied] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
    }
  }

  const updateMutation = useMutation({
    mutationFn: (data: Partial<typeof form>) => http.patch<Tenant>(`/tenants/${tenant.id}`, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tenant', tenant.id] })
      setApiError(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => {
      setApiError(err instanceof HttpError ? err.message : 'Error al guardar cambios')
    },
  })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateMutation.mutate(form)
  }

  function copyId() {
    void navigator.clipboard.writeText(tenant.id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* ID read-only */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">ID del tenant</label>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={tenant.id}
            className="flex-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-default outline-none font-mono"
          />
          <button
            type="button"
            onClick={copyId}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombre *" placeholder="Gastromedicall Ltda" {...field('name')} required />
        <Field label="Nombre comercial" placeholder="Gastromedicall" {...field('tradeName')} />
        <Field label="NIT *" placeholder="9001234567" {...field('nit')} required />
        <Field label="Representante legal" placeholder="Dr. Carlos Pérez" {...field('legalRepName')} />
        <Field label="Teléfono" placeholder="+576012345678" {...field('phone')} />
        <Field label="Correo electrónico" type="email" placeholder="contacto@clinica.com" {...field('email')} />
        <Field label="Zona horaria" placeholder="America/Bogota" {...field('timezone')} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <option value="platform">Platform</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Estado</label>
          <select
            value={form.subscriptionStatus}
            onChange={(e) => setForm((f) => ({ ...f, subscriptionStatus: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
          >
            <option value="trial">Trial</option>
            <option value="active">Activo</option>
            <option value="suspended">Suspendido</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {apiError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {apiError}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300 transition-colors"
        >
          {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Cambios guardados
          </span>
        )}
      </div>
    </form>
  )
}

/* ── Tab: Servicios ── */
function ServicesTab({ tenantId }: { tenantId: string }) {
  const qc = useQueryClient()

  const { data: features = [], isLoading } = useQuery({
    queryKey: ['tenant-features', tenantId],
    queryFn: () => http.get<Feature[]>(`/tenants/${tenantId}/features`),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ key, isEnabled }: { key: string; isEnabled: boolean }) =>
      http.post(`/tenants/${tenantId}/features/${key}/toggle`, { isEnabled }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['tenant-features', tenantId] }),
  })

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        Cargando servicios...
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <div
          key={f.key}
          className={`rounded-xl border p-4 transition-colors ${
            f.isEnabled
              ? 'border-purple-200 bg-purple-50/40'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`font-medium text-sm ${f.isEnabled ? 'text-slate-900' : 'text-slate-500'}`}>
                {f.label}
              </p>
              <p className={`mt-0.5 text-xs ${f.isEnabled ? 'text-slate-600' : 'text-slate-400'}`}>
                {f.description}
              </p>
              {f.isEnabled && f.enabledAt && (
                <p className="mt-1.5 text-[10px] text-purple-500">
                  Habilitado: {new Date(f.enabledAt).toLocaleDateString('es-CO')}
                </p>
              )}
            </div>
            <button
              onClick={() => toggleMutation.mutate({ key: f.key, isEnabled: !f.isEnabled })}
              disabled={toggleMutation.isPending}
              className="shrink-0 transition-opacity disabled:opacity-50"
              title={f.isEnabled ? 'Deshabilitar' : 'Habilitar'}
            >
              {f.isEnabled ? (
                <ToggleRight className="h-7 w-7 text-purple-600" />
              ) : (
                <ToggleLeft className="h-7 w-7 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Tab: Sedes ── */
function SitesTab({ tenantId }: { tenantId: string }) {
  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['tenant-sites', tenantId],
    queryFn: () => http.get<Site[]>(`/tenants/${tenantId}/sites`),
  })

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        Cargando sedes...
      </div>
    )
  }

  if (sites.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        No hay sedes registradas
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3 hidden sm:table-cell">Ciudad</th>
              <th className="px-4 py-3 hidden md:table-cell">Dirección</th>
              <th className="px-4 py-3 text-center">Principal</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sites.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{s.city ?? '—'}</td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-xs">{s.address ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  {s.isMain && (
                    <span className="rounded bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                      Principal
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {s.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Tab: Usuarios ── */
function UsersTab({ tenantId }: { tenantId: string }) {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: () => http.get<TenantUser[]>(`/tenants/${tenantId}/users`),
  })

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        Cargando usuarios...
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        No hay usuarios registrados
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3 hidden sm:table-cell">Email</th>
              <th className="px-4 py-3 hidden md:table-cell">Roles</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 hidden lg:table-cell">Último acceso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <p className="font-medium text-slate-900">{u.firstName} {u.lastName}</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-slate-500 text-xs">{u.email}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length > 0 ? (
                      u.roles.map((r) => (
                        <span
                          key={r.role.id}
                          className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {r.role.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Sin rol</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('es-CO') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Main ── */
type Tab = 'info' | 'services' | 'sites' | 'users'

const TABS: { key: Tab; label: string }[] = [
  { key: 'info', label: 'Información' },
  { key: 'services', label: 'Servicios' },
  { key: 'sites', label: 'Sedes' },
  { key: 'users', label: 'Usuarios' },
]

export function TenantDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('info')

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => http.get<Tenant>(`/tenants/${id}`),
  })

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex h-40 items-center justify-center text-sm text-slate-400">
          Cargando empresa...
        </div>
      </main>
    )
  }

  if (error || !tenant) {
    return (
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="flex h-40 items-center justify-center text-sm text-red-500">
          Error al cargar la empresa
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/tenants')}
          className="mb-3 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a empresas
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{tenant.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500">NIT: {tenant.nit}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'info' && <InfoTab tenant={tenant} />}
      {activeTab === 'services' && <ServicesTab tenantId={id} />}
      {activeTab === 'sites' && <SitesTab tenantId={id} />}
      {activeTab === 'users' && <UsersTab tenantId={id} />}
    </main>
  )
}
