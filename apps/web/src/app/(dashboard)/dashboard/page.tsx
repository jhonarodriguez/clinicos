import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  UserPlus,
  XCircle,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

/* ── KPI Card ── */
function KpiCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
  iconBg,
  iconColor,
  trendColor,
}: {
  label: string
  value: string
  sub: string
  trend: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  trendColor: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-[18px] w-[18px] ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 lg:text-3xl">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
      <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
        <TrendingUp className="h-3.5 w-3.5" />
        {trend}
      </div>
    </div>
  )
}

/* ── Status badge ── */
const badgeStyles: Record<string, string> = {
  Confirmada: 'bg-blue-50 text-blue-700',
  'En curso': 'bg-green-50 text-green-700',
  Pendiente: 'bg-amber-50 text-amber-700',
  Cancelada: 'bg-red-50 text-red-700',
}
function Badge({ status }: { status: string }) {
  return (
    <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-medium ${badgeStyles[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

/* ── Appointment row ── */
function AptRow({
  time, dotColor, name, detail, status, alt,
}: {
  time: string; dotColor: string; name: string; detail: string; status: string; alt?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${alt ? 'bg-slate-50' : 'bg-white'}`}>
      <span className="w-10 shrink-0 text-xs font-medium text-slate-500">{time}</span>
      <div className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{name}</p>
        <p className="truncate text-xs text-slate-500">{detail}</p>
      </div>
      <Badge status={status} />
    </div>
  )
}

/* ── Activity event ── */
function ActivityEvent({
  icon: Icon, iconBg, iconColor, msg, detail,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string; msg: string; detail: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900">{msg}</p>
        <p className="text-xs text-slate-400">{detail}</p>
      </div>
    </div>
  )
}

/* ── Bar row ── */
function BarRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-14 shrink-0 text-xs text-slate-500">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-xs text-slate-500">{pct}%</span>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 space-y-4 lg:p-6 lg:space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 lg:text-2xl">Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Martes, 25 de marzo de 2026 · Sede Principal
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 xl:grid-cols-4">
        <KpiCard label="Citas hoy" value="24" sub="3 en espera de atención" trend="+18% vs semana anterior" icon={Calendar} iconBg="bg-blue-50" iconColor="text-blue-600" trendColor="text-blue-600" />
        <KpiCard label="Procedimientos" value="8" sub="2 en curso ahora" trend="+5% vs semana anterior" icon={Activity} iconBg="bg-teal-50" iconColor="text-teal-600" trendColor="text-teal-600" />
        <KpiCard label="Pacientes atendidos" value="142" sub="18 nuevos esta semana" trend="+12% este mes" icon={Users} iconBg="bg-green-50" iconColor="text-green-600" trendColor="text-green-600" />
        <KpiCard label="Ingresos del día" value="$4.2M" sub="Meta diaria: $6M (70%)" trend="+8% vs ayer" icon={DollarSign} iconBg="bg-amber-50" iconColor="text-amber-600" trendColor="text-amber-600" />
      </div>

      {/* Mid row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
        {/* Agenda de hoy */}
        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">Agenda de hoy</span>
            <Link href="/agenda" className="text-xs font-medium text-blue-600 hover:underline">Ver todo →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            <AptRow time="08:30" dotColor="bg-blue-500" name="María García López" detail="Consulta general · Dr. Ramírez" status="Confirmada" />
            <AptRow time="09:00" dotColor="bg-teal-500" name="Carlos Mendoza Rivera" detail="Control · Dra. Torres" status="En curso" alt />
            <AptRow time="09:30" dotColor="bg-amber-400" name="Ana Martínez Duque" detail="Ecografía · Dr. Reyes" status="Pendiente" />
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="rounded-xl border border-slate-200 bg-white lg:w-80 lg:shrink-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">Actividad reciente</span>
            <span className="text-xs text-slate-400">Últimas 24h</span>
          </div>
          <div className="space-y-4 p-4">
            <ActivityEvent icon={UserPlus} iconBg="bg-blue-50" iconColor="text-blue-600" msg="Nuevo paciente registrado" detail="Pedro Suárez · hace 15 min" />
            <ActivityEvent icon={FileText} iconBg="bg-green-50" iconColor="text-green-600" msg="Historia clínica actualizada" detail="María García · hace 32 min" />
            <ActivityEvent icon={CreditCard} iconBg="bg-amber-50" iconColor="text-amber-600" msg="Pago procesado" detail="$85.000 · Consulta particular" />
            <ActivityEvent icon={XCircle} iconBg="bg-red-50" iconColor="text-red-600" msg="Cita cancelada" detail="Luis Peña · 10:00 am" />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
        {/* Ocupación */}
        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-4 space-y-4 lg:p-5">
          <span className="text-sm font-semibold text-slate-900">Ocupación por consultorio</span>
          <div className="space-y-3">
            <BarRow label="Cons. 1" pct={85} color="bg-blue-600" />
            <BarRow label="Cons. 2" pct={62} color="bg-teal-500" />
            <BarRow label="Cons. 3" pct={45} color="bg-violet-500" />
            <BarRow label="Cons. 4" pct={100} color="bg-amber-400" />
          </div>
        </div>

        {/* Alertas */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 lg:w-80 lg:shrink-0 lg:p-5">
          <span className="text-sm font-semibold text-slate-900">Alertas del día</span>
          <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-xs text-red-800">3 citas sin confirmar para mañana</p>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 p-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-900">Consultorio 2 sin médico 14:00–16:00</p>
          </div>
        </div>
      </div>
    </main>
  )
}
