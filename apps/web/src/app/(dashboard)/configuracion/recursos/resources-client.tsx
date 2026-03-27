'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Pencil, Trash2, X, DoorOpen, Cpu } from 'lucide-react'
import { http, HttpError } from '@/lib/http'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Site {
  id: string
  name: string
  isMain: boolean
}

interface Room {
  id: string
  siteId: string
  name: string
  code?: string
  roomType: string
  capacity?: number
  floor?: string
  isActive: boolean
}

interface Equipment {
  id: string
  siteId: string
  roomId?: string
  name: string
  code?: string
  equipmentType: string
  brand?: string
  model?: string
  serialNumber?: string
  maintenanceStatus: string
  isActive: boolean
}

const ROOM_TYPES = [
  { value: 'consulting', label: 'Consultorio' },
  { value: 'surgery', label: 'Quirófano' },
  { value: 'recovery', label: 'Recuperación' },
  { value: 'diagnostic', label: 'Diagnóstico' },
  { value: 'other', label: 'Otro' },
]

const MAINTENANCE_STATUSES = [
  { value: 'operational', label: 'Operativo' },
  { value: 'maintenance', label: 'En mantenimiento' },
  { value: 'out_of_service', label: 'Fuera de servicio' },
]

const RT_LABELS: Record<string, string> = Object.fromEntries(ROOM_TYPES.map((r) => [r.value, r.label]))
const MS_LABELS: Record<string, string> = Object.fromEntries(MAINTENANCE_STATUSES.map((m) => [m.value, m.label]))
const MS_COLORS: Record<string, string> = {
  operational: 'bg-green-50 text-green-700',
  maintenance: 'bg-amber-50 text-amber-700',
  out_of_service: 'bg-red-50 text-red-700',
}

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

// ── Room Modal ────────────────────────────────────────────────────────────────

function RoomModal({
  sites,
  initial,
  onClose,
  onSave,
  loading,
  error,
}: {
  sites: Site[]
  initial?: Room
  onClose: () => void
  onSave: (data: object) => void
  loading: boolean
  error: string | null
}) {
  const [form, setForm] = useState({
    siteId: initial?.siteId ?? sites[0]?.id ?? '',
    name: initial?.name ?? '',
    code: initial?.code ?? '',
    roomType: initial?.roomType ?? 'consulting',
    capacity: initial?.capacity ?? 1,
    floor: initial?.floor ?? '',
  })

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      siteId: form.siteId,
      name: form.name,
      code: form.code || undefined,
      roomType: form.roomType,
      capacity: Number(form.capacity) || 1,
      floor: form.floor || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {initial ? 'Editar consultorio' : 'Nuevo consultorio/sala'}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <Field label="Sede" required>
            <select className={selectCls} value={form.siteId} onChange={set('siteId')} disabled={!!initial}>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Nombre" required>
            <input className={inputCls} value={form.name} onChange={set('name')} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código">
              <input className={inputCls} placeholder="C-01" value={form.code} onChange={set('code')} />
            </Field>
            <Field label="Tipo" required>
              <select className={selectCls} value={form.roomType} onChange={set('roomType')}>
                {ROOM_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </Field>
            <Field label="Capacidad">
              <input type="number" min={1} className={inputCls} value={form.capacity} onChange={set('capacity')} />
            </Field>
            <Field label="Piso">
              <input className={inputCls} placeholder="1" value={form.floor} onChange={set('floor')} />
            </Field>
          </div>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Guardando...' : initial ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Equipment Modal ───────────────────────────────────────────────────────────

function EquipmentModal({
  sites,
  rooms,
  initial,
  onClose,
  onSave,
  loading,
  error,
}: {
  sites: Site[]
  rooms: Room[]
  initial?: Equipment
  onClose: () => void
  onSave: (data: object) => void
  loading: boolean
  error: string | null
}) {
  const [form, setForm] = useState({
    siteId: initial?.siteId ?? sites[0]?.id ?? '',
    name: initial?.name ?? '',
    code: initial?.code ?? '',
    equipmentType: initial?.equipmentType ?? '',
    brand: initial?.brand ?? '',
    model: initial?.model ?? '',
    serialNumber: initial?.serialNumber ?? '',
    roomId: initial?.roomId ?? '',
    maintenanceStatus: initial?.maintenanceStatus ?? 'operational',
  })

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const filteredRooms = rooms.filter((r) => r.siteId === form.siteId && r.isActive)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      siteId: form.siteId,
      name: form.name,
      code: form.code || undefined,
      equipmentType: form.equipmentType,
      brand: form.brand || undefined,
      model: form.model || undefined,
      serialNumber: form.serialNumber || undefined,
      roomId: form.roomId || undefined,
      maintenanceStatus: form.maintenanceStatus,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {initial ? 'Editar equipo' : 'Registrar equipo'}
          </h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Nombre del equipo" required>
                <input className={inputCls} value={form.name} onChange={set('name')} required />
              </Field>
            </div>
            <Field label="Sede" required>
              <select className={selectCls} value={form.siteId} onChange={set('siteId')} disabled={!!initial}>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Sala/Consultorio">
              <select className={selectCls} value={form.roomId} onChange={set('roomId')}>
                <option value="">Sin asignar</option>
                {filteredRooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Tipo de equipo" required>
              <input className={inputCls} placeholder="endoscope, monitor, etc." value={form.equipmentType} onChange={set('equipmentType')} required />
            </Field>
            <Field label="Estado">
              <select className={selectCls} value={form.maintenanceStatus} onChange={set('maintenanceStatus')}>
                {MAINTENANCE_STATUSES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Marca">
              <input className={inputCls} value={form.brand} onChange={set('brand')} />
            </Field>
            <Field label="Modelo">
              <input className={inputCls} value={form.model} onChange={set('model')} />
            </Field>
          </div>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {loading ? 'Guardando...' : initial ? 'Guardar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Tab = 'rooms' | 'equipment'

export function ResourcesClient() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('rooms')
  const [roomModal, setRoomModal] = useState<{ open: boolean; room?: Room }>({ open: false })
  const [eqModal, setEqModal] = useState<{ open: boolean; equipment?: Equipment }>({ open: false })
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => http.get<Site[]>('/tenants/sites').catch(() => []),
  })

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => http.get<Room[]>('/rooms'),
  })

  const { data: equipment = [], isLoading: eqLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => http.get<Equipment[]>('/equipment'),
  })

  const createRoom = useMutation({
    mutationFn: (payload: object) => http.post<Room>('/rooms', payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['rooms'] }); setRoomModal({ open: false }); setApiError(null) },
    onError: (err) => setApiError(err instanceof HttpError ? err.message : 'Error al crear consultorio'),
  })

  const deleteRoom = useMutation({
    mutationFn: (id: string) => http.delete<{ message: string }>(`/rooms/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['rooms'] }),
  })

  const createEq = useMutation({
    mutationFn: (payload: object) => http.post<Equipment>('/equipment', payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['equipment'] }); setEqModal({ open: false }); setApiError(null) },
    onError: (err) => setApiError(err instanceof HttpError ? err.message : 'Error al registrar equipo'),
  })

  const deleteEq = useMutation({
    mutationFn: (id: string) => http.delete<{ message: string }>(`/equipment/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['equipment'] }),
  })

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Recursos</h1>
          <p className="mt-0.5 text-sm text-slate-500">Consultorios, salas y equipos</p>
        </div>
        <button
          onClick={() => { setApiError(null); tab === 'rooms' ? setRoomModal({ open: true }) : setEqModal({ open: true }) }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {tab === 'rooms' ? 'Nueva sala' : 'Nuevo equipo'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit">
        {([['rooms', 'Consultorios / Salas', DoorOpen], ['equipment', 'Equipos', Cpu]] as const).map(
          ([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ),
        )}
      </div>

      {/* Rooms table */}
      {tab === 'rooms' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {roomsLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">Cargando consultorios...</div>
          ) : rooms.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-slate-400">
              <DoorOpen className="h-8 w-8 opacity-30" />No hay consultorios registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                    <th className="px-4 py-3">Sala / Consultorio</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Tipo</th>
                    <th className="px-4 py-3 hidden md:table-cell">Capacidad</th>
                    <th className="px-4 py-3 hidden md:table-cell">Piso</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rooms.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{r.name}</p>
                        {r.code && <p className="text-xs text-slate-500">{r.code}</p>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {RT_LABELS[r.roomType] ?? r.roomType}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-600">{r.capacity ?? 1}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">{r.floor ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setApiError(null); setRoomModal({ open: true, room: r }) }} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => deleteRoom.mutate(r.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
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
      )}

      {/* Equipment table */}
      {tab === 'equipment' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {eqLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">Cargando equipos...</div>
          ) : equipment.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-slate-400">
              <Cpu className="h-8 w-8 opacity-30" />No hay equipos registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                    <th className="px-4 py-3">Equipo</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Tipo</th>
                    <th className="px-4 py-3 hidden md:table-cell">Marca / Modelo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {equipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{eq.name}</p>
                        {eq.serialNumber && <p className="text-xs text-slate-500">S/N: {eq.serialNumber}</p>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">{eq.equipmentType}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-600">
                        {[eq.brand, eq.model].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${MS_COLORS[eq.maintenanceStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                          {MS_LABELS[eq.maintenanceStatus] ?? eq.maintenanceStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setApiError(null); setEqModal({ open: true, equipment: eq }) }} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => deleteEq.mutate(eq.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
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
      )}

      {roomModal.open && (
        <RoomModal
          sites={sites}
          initial={roomModal.room}
          onClose={() => { setRoomModal({ open: false }); setApiError(null) }}
          onSave={(data) => createRoom.mutate(data)}
          loading={createRoom.isPending}
          error={apiError}
        />
      )}

      {eqModal.open && (
        <EquipmentModal
          sites={sites}
          rooms={rooms}
          initial={eqModal.equipment}
          onClose={() => { setEqModal({ open: false }); setApiError(null) }}
          onSave={(data) => createEq.mutate(data)}
          loading={createEq.isPending}
          error={apiError}
        />
      )}
    </main>
  )
}
