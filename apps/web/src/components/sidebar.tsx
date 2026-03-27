'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  Bell,
  Calendar,
  Cpu,
  DoorOpen,
  FileText,
  LayoutDashboard,
  Receipt,
  Settings,
  Shield,
  Stethoscope,
  Users,
  X,
} from 'lucide-react'

const clinicaNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/profesionales', label: 'Profesionales', icon: Stethoscope },
  { href: '/historia-clinica', label: 'Historia Clínica', icon: FileText },
]

const adminNav = [
  { href: '/facturacion', label: 'Facturación', icon: Receipt },
  { href: '/configuracion/servicios', label: 'Tipos de Servicio', icon: Activity },
  { href: '/configuracion/recursos', label: 'Recursos', icon: DoorOpen },
  { href: '/settings/users', label: 'Usuarios', icon: Settings },
  { href: '/settings/roles', label: 'Roles y Permisos', icon: Shield },
]

function NavItem({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string
  label: string
  icon: React.ElementType
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? 'bg-blue-900/60 font-medium text-white'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${active ? 'text-blue-400' : 'text-slate-500'}`}
      />
      {label}
    </Link>
  )
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

function SidebarContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">ClinicOS</span>
        </div>
        {/* Close button — solo visible en mobile */}
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        <div>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Clínica
          </p>
          <div className="space-y-0.5">
            {clinicaNav.map((item) => (
              <NavItem key={item.href} {...item} onNavigate={onClose} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Administración
          </p>
          <div className="space-y-0.5">
            {adminNav.map((item) => (
              <NavItem key={item.href} {...item} onNavigate={onClose} />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-800 px-3 py-3 space-y-1">
        <button className="relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
          <Bell className="h-4 w-4" />
          Notificaciones
          <span className="absolute right-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            FV
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">Dr. Fabián Varón</p>
            <p className="truncate text-xs text-slate-500">Médico General</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* ── Desktop: sidebar fija ── */}
      <aside className="hidden h-screen w-60 shrink-0 lg:flex lg:flex-col">
        <SidebarContent onClose={onClose} />
      </aside>

      {/* ── Mobile: overlay drawer ── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  )
}
