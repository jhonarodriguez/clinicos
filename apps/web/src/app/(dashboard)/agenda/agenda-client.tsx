'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, User, X } from 'lucide-react'

type Appointment = {
  id: number
  time: string
  name: string | null
  detail: string | null
  status: string | null
  statusColor: string
  blockBg: string
  blockBorder: string
  titleColor: string
  subColor: string
}

const appointments: Appointment[] = [
  {
    id: 1,
    time: '08:30 – 09:00',
    name: 'María García López',
    detail: 'Consulta general · Dr. Ramírez',
    status: 'Confirmada',
    statusColor: 'bg-blue-50 text-blue-700',
    blockBg: 'bg-blue-50',
    blockBorder: 'border-blue-200',
    titleColor: 'text-blue-900',
    subColor: 'text-blue-500',
  },
  {
    id: 2,
    time: '09:00 – 09:30',
    name: 'Carlos Mendoza Rivera',
    detail: 'Control · Dra. Torres',
    status: 'En curso',
    statusColor: 'bg-green-50 text-green-700',
    blockBg: 'bg-green-50',
    blockBorder: 'border-green-200',
    titleColor: 'text-green-900',
    subColor: 'text-green-600',
  },
  {
    id: 3,
    time: '09:30 – 10:00',
    name: 'Ana Martínez Duque',
    detail: 'Ecografía · Dr. Reyes',
    status: 'Pendiente',
    statusColor: 'bg-amber-50 text-amber-700',
    blockBg: 'bg-amber-50',
    blockBorder: 'border-amber-200',
    titleColor: 'text-amber-900',
    subColor: 'text-amber-600',
  },
  {
    id: 4,
    time: '10:00 – 10:30',
    name: null,
    detail: null,
    status: null,
    statusColor: '',
    blockBg: '',
    blockBorder: '',
    titleColor: '',
    subColor: '',
  },
  {
    id: 5,
    time: '11:00 – 11:30',
    name: 'Roberto Díaz Parra',
    detail: 'Laboratorio · Dr. Vargas',
    status: 'Confirmada',
    statusColor: 'bg-violet-50 text-violet-700',
    blockBg: 'bg-violet-50',
    blockBorder: 'border-violet-200',
    titleColor: 'text-violet-900',
    subColor: 'text-violet-600',
  },
]

const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00']

/* ── Detail Panel ── */
function DetailPanel({
  apt,
  onClose,
}: {
  apt: Appointment
  onClose: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">Detalle de cita</span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{apt.name}</p>
            <p className="text-xs text-slate-500">CC 1.234.567.890 · 34 años</p>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="space-y-3">
          {[
            { label: 'Tipo', value: 'Consulta general' },
            { label: 'Médico', value: 'Dr. Ramírez' },
            { label: 'Hora', value: apt.time },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <span className="font-medium text-slate-900">{value}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Estado</span>
            <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${apt.statusColor}`}>
              {apt.status}
            </span>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="space-y-1.5">
          <p className="text-xs text-slate-400">Notas</p>
          <p className="text-xs leading-relaxed text-slate-600">
            Paciente refiere dolor de cabeza frecuente. Control mensual de hipertensión.
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-100 p-4">
        <button className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          Iniciar consulta
        </button>
        <button className="w-full rounded-lg border border-slate-200 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
          Cancelar cita
        </button>
      </div>
    </div>
  )
}

export function AgendaClient() {
  const [selected, setSelected] = useState<Appointment | null>(appointments[0]!)
  const [detailOpen, setDetailOpen] = useState(false)

  function selectApt(apt: Appointment) {
    setSelected(apt)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* ── Calendar panel ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 lg:px-4 lg:py-3">
          <div className="flex items-center gap-1.5">
            <button className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-semibold text-slate-900">Martes 25 de marzo</span>
            <button className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {(['Día', 'Semana', 'Mes'] as const).map((v, i) => (
                <button
                  key={v}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    i === 0
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nueva cita</span>
            </button>
          </div>
        </div>

        {/* Time grid */}
        <div className="flex flex-1 overflow-y-auto">
          {/* Hour labels */}
          <div className="w-14 shrink-0 border-r border-slate-100 bg-slate-50 lg:w-16">
            {hours.map((h) => (
              <div key={h} className="flex h-20 items-start justify-center pt-2">
                <span className="text-[10px] text-slate-400 lg:text-[11px]">{h}</span>
              </div>
            ))}
          </div>

          {/* Slots */}
          <div className="flex-1 divide-y divide-slate-50">
            {appointments.map((apt, i) => (
              <div
                key={apt.id}
                className={`flex h-20 items-stretch gap-2 p-2 ${i % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}
              >
                {apt.name ? (
                  <button
                    onClick={() => selectApt(apt)}
                    className={`flex flex-1 flex-col justify-center gap-1 rounded-lg border px-3 py-2 text-left transition-shadow hover:shadow-sm ${apt.blockBg} ${apt.blockBorder}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm font-semibold ${apt.titleColor}`}>
                        {apt.name}
                      </span>
                      <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-medium ${apt.statusColor}`}>
                        {apt.status}
                      </span>
                    </div>
                    <span className={`text-xs ${apt.subColor}`}>
                      {apt.time} · {apt.detail}
                    </span>
                  </button>
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200">
                    <span className="text-xs text-slate-300">+ Agregar cita</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop: detail panel fijo ── */}
      {selected && (
        <aside className="hidden w-72 shrink-0 border-l border-slate-200 lg:flex lg:flex-col">
          <DetailPanel apt={selected} onClose={() => setSelected(null)} />
        </aside>
      )}

      {/* ── Mobile: detail panel como bottom drawer ── */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden ${
              detailOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setDetailOpen(false)}
          />
          {/* Drawer */}
          <div
            className={`fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
              detailOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Handle */}
            <div className="flex justify-center bg-white pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>
            <DetailPanel apt={selected} onClose={() => setDetailOpen(false)} />
          </div>
        </>
      )}
    </div>
  )
}
