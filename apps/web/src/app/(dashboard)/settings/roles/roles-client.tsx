'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Shield, ShieldCheck, ShieldOff } from 'lucide-react'
import { http, HttpError } from '@/lib/http'

interface Permission {
  id: string
  module: string
  resource: string
  action: string
  description: string | null
}

interface RolePermission {
  id: string
  permission: Permission
}

interface Role {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  permissions: RolePermission[]
  _count: { users: number }
}

/* ── Modal nuevo rol ── */
function RoleModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, description: string) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es requerido'); return }
    onSave(name.trim(), description.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Nuevo rol</h2>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Nombre *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Enfermero"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Descripción</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Personal de enfermería"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Crear rol
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Panel de permisos ── */
function PermissionsPanel({ role, allPermissions }: { role: Role; allPermissions: Permission[] }) {
  const qc = useQueryClient()

  const assignedIds = new Set(role.permissions.map((rp) => rp.permission.id))

  const assign = useMutation({
    mutationFn: (permissionId: string) => http.post(`/roles/${role.id}/permissions`, { permissionId }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['roles'] }),
  })

  const remove = useMutation({
    mutationFn: (permissionId: string) => http.delete(`/roles/${role.id}/permissions/${permissionId}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['roles'] }),
  })

  // Agrupar por módulo
  const byModule = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = []
    acc[p.module]!.push(p)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(byModule).map(([module, perms]) => (
        <div key={module}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{module}</p>
          <div className="space-y-1">
            {perms.map((p) => {
              const isAssigned = assignedIds.has(p.id)
              return (
                <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    disabled={role.isSystem || assign.isPending || remove.isPending}
                    onChange={() => {
                      if (isAssigned) remove.mutate(p.id)
                      else assign.mutate(p.id)
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{p.resource}</span>
                      <span className="mx-1 text-slate-400">·</span>
                      <span className="text-slate-500">{p.action}</span>
                    </p>
                    {p.description && <p className="text-xs text-slate-400">{p.description}</p>}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      ))}
      {allPermissions.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">No hay permisos configurados</p>
      )}
    </div>
  )
}

/* ── Main ── */
export function RolesClient() {
  const qc = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => http.get<Role[]>('/roles'),
  })

  const { data: allPermissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => http.get<Permission[]>('/roles/permissions'),
  })

  const selectedRole = roles.find((r) => r.id === selectedId) ?? null

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => http.post<Role>('/roles', data),
    onSuccess: (newRole) => {
      void qc.invalidateQueries({ queryKey: ['roles'] })
      setSelectedId(newRole.id)
      setModalOpen(false)
      setApiError(null)
    },
    onError: (err) => setApiError(err instanceof HttpError ? err.message : 'Error al crear rol'),
  })

  return (
    <main className="flex h-full overflow-hidden">
      {/* Panel izquierdo — lista de roles */}
      <div className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h1 className="text-sm font-semibold text-slate-900">Roles</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Nuevo
          </button>
        </div>

        {apiError && (
          <div className="mx-3 mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {apiError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {rolesLoading ? (
            <p className="px-4 py-8 text-center text-xs text-slate-400">Cargando...</p>
          ) : roles.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-slate-400">Sin roles</p>
          ) : (
            roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  selectedId === r.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className={`h-4 w-4 shrink-0 ${selectedId === r.id ? 'text-blue-600' : 'text-slate-400'}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${selectedId === r.id ? 'text-blue-700' : 'text-slate-700'}`}>
                    {r.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {r._count.users} usuario{r._count.users !== 1 ? 's' : ''} · {r.permissions.length} permiso{r.permissions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {r.isSystem && (
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">sistema</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Panel derecho — permisos del rol seleccionado */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedRole ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Shield className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-400">Selecciona un rol para gestionar sus permisos</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{selectedRole.name}</h2>
                {selectedRole.description && <p className="mt-0.5 text-sm text-slate-500">{selectedRole.description}</p>}
              </div>
              {selectedRole.isSystem && (
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                  <ShieldOff className="h-3.5 w-3.5" />
                  Rol de sistema — permisos no editables
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <PermissionsPanel role={selectedRole} allPermissions={allPermissions} />
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <RoleModal
          onClose={() => { setModalOpen(false); setApiError(null) }}
          onSave={(name, description) => createMutation.mutate({ name, description })}
        />
      )}
    </main>
  )
}
