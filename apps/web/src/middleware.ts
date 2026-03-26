import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/api']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas: pasar siempre
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // La presencia de la cookie refresh_token indica sesión activa
  const hasSession = request.cookies.has('refresh_token')

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
