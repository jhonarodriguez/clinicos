'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { AuthProvider } from '@/providers/auth-provider'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/agenda': 'Agenda',
  '/pacientes': 'Pacientes',
  '/historia-clinica': 'Historia Clínica',
  '/procedimientos': 'Procedimientos',
  '/facturacion': 'Facturación',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const title = titles[pathname] ?? 'ClinicOS'

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </AuthProvider>
  )
}
