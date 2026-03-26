import type { Metadata } from 'next'
import { CheckCircle2, Plus } from 'lucide-react'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* ── Panel izquierdo azul ── */}
      <div className="hidden w-1/2 flex-col justify-between bg-blue-600 p-12 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
            <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-white">ClinicOS</span>
        </div>

        {/* Central copy */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Gestión inteligente para IPS</h2>
          </div>
          <ul className="space-y-4">
            {[
              'Agenda y procedimientos integrados',
              'Historia clínica electrónica',
              'Facturación electrónica RIPS',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-blue-100">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-200" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-blue-300">© 2025 ClinicOS</p>
      </div>

      {/* ── Panel derecho blanco ── */}
      <div className="flex w-full flex-col justify-between p-8 lg:w-1/2 lg:p-16">
        <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          ClinicOS
        </div>

        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
            <p className="text-sm text-slate-500">Ingresa a tu cuenta para continuar</p>
          </div>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-slate-400">
          © 2025 ClinicOS · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
