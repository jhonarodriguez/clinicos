'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, type AuthUser } from '@/stores/auth.store'

// Flag a nivel de módulo: persiste entre los dos montajes de StrictMode
let refreshInFlight = false

interface MeResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  tenantId: string
  isActive: boolean
  lastLoginAt: string | null
  roles: { role: { id: string; name: string } }[]
}

interface AuthProviderProps {
  children: React.ReactNode
  requiredRole?: string
}

export function AuthProvider({ children, requiredRole }: AuthProviderProps) {
  const [ready, setReady] = useState(false)
  const { accessToken, user, setAuth, clearAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Si ya hay token en memoria (navegación normal), solo verificar rol si aplica
    if (accessToken) {
      if (requiredRole && !user?.roles.includes(requiredRole)) {
        router.replace('/dashboard')
        return
      }
      setReady(true)
      return
    }

    if (refreshInFlight) return
    refreshInFlight = true

    // En recarga: intentar recuperar sesión con la cookie refresh_token
    fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          refreshInFlight = false
          clearAuth()
          router.replace('/login')
          return
        }

        const body = (await res.json()) as { data: { accessToken: string } }
        const token = body.data.accessToken

        // Restaurar el objeto user via /auth/me
        const meRes = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })

        if (!meRes.ok) {
          refreshInFlight = false
          clearAuth()
          router.replace('/login')
          return
        }

        const meBody = (await meRes.json()) as { data: MeResponse }
        const me = meBody.data
        const user: AuthUser = {
          id: me.id,
          email: me.email,
          firstName: me.firstName,
          lastName: me.lastName,
          tenantId: me.tenantId,
          roles: me.roles.map((r) => r.role.name),
        }

        setAuth(token, user)

        // Verificar rol requerido
        if (requiredRole && !user.roles.includes(requiredRole)) {
          router.replace('/dashboard')
          return
        }

        setReady(true)
      })
      .catch(() => {
        refreshInFlight = false
        clearAuth()
        router.replace('/login')
      })
  }, [])

  if (!ready) return null

  return <>{children}</>
}
