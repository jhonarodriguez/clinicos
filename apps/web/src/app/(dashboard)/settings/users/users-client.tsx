'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import { http, HttpError } from '@/lib/http'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  roles: { role: { id: string; name: string } }[]
}

interface CreateUserPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

/* ── Modal ── */
function UserModal({ onClose, onSave }: { onClose: () => void; onSave: (data: CreateUserPayload) => void }) {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' })
  const [error, setError] = useState<string | null>(null)

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setError('Todos los campos obligatorios son requeridos')
      return
    }
    onSave({ ...form, phone: form.phone || undefined })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Nuevo usuario</h2>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre *" placeholder="Juan" {...field('firstName')} />
            <Field label="Apellido *" placeholder="Pérez" {...field('lastName')} />
          </div>
          <Field label="Correo electrónico *" type="email" placeholder="medico@clinica.com" {...field('email')} />
          <Field label="Contraseña *" type="password" placeholder="Min. 8 caracteres, 1 mayúscula, 1 número" {...field('password')} />
          <Field label="Teléfono" placeholder="+573001234567" {...field('phone')} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Crear usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
        {...props}
      />
    </div>
  )
}

/* ── Main ── */
export function UsersClient() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => http.get<User[]>('/users'),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => http.post<User>('/users', payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] })
      setModalOpen(false)
      setApiError(null)
    },
    onError: (err) => {
      setApiError(err instanceof HttpError ? err.message : 'Error al crear usuario')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => http.delete<{ message: string }>(`/users/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['users'] }),
  })

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Usuarios</h1>
          <p className="mt-0.5 text-sm text-slate-500">Gestión de usuarios del tenant</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </button>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            Cargando usuarios...
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            No hay usuarios registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Roles</th>
                  <th className="px-4 py-3 hidden md:table-cell">Último acceso</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length > 0 ? (
                          u.roles.map((r) => (
                            <span key={r.role.id} className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                              <ShieldCheck className="h-3 w-3" />{r.role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Sin rol</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('es-CO') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(u.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {modalOpen && (
        <UserModal
          onClose={() => { setModalOpen(false); setApiError(null) }}
          onSave={(data) => createMutation.mutate(data)}
        />
      )}
    </main>
  )
}
