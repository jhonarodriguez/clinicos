'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, LogOut } from 'lucide-react'
import { AuthProvider } from '@/providers/auth-provider'
import { useAuthStore } from '@/stores/auth.store'

function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  async function handleLogout() {
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    clearAuth()
    router.replace('/login')
  }

  const tenantsActive = pathname === '/admin/tenants' || pathname.startsWith('/admin/tenants/')

  return (
    <div className="flex h-full flex-col bg-slate-800">
      {/* Logo */}
      <div className="flex h-14 items-center px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-600">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">ClinicOS</span>
            <span className="ml-1.5 rounded bg-purple-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-200">
              Platform
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Administración
          </p>
          <div className="space-y-0.5">
            <Link
              href="/admin/tenants"
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                tenantsActive
                  ? 'bg-purple-900/60 font-medium text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Building2
                className={`h-4 w-4 shrink-0 ${tenantsActive ? 'text-purple-400' : 'text-slate-500'}`}
              />
              Empresas
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-700 px-3 py-3 space-y-1">
        {user && (
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider requiredRole="SUPER_ADMIN">
      <div className="flex h-screen overflow-hidden bg-slate-100">
        {/* Sidebar */}
        <aside className="hidden h-screen w-60 shrink-0 lg:flex lg:flex-col">
          <AdminNav />
        </aside>
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </AuthProvider>
  )
}
