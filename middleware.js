import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Rotas públicas
  const publicPaths = ['/', '/api/auth/login', '/api/auth/sync', '/api/auth/logout']
  
  // Se for rota pública, permitir
  if (publicPaths.some(path => pathname === path)) {
    return NextResponse.next()
  }

  // Verificar se tem sessão
  const session = request.cookies.get('francaverso_session')

  // Se não tiver sessão e tentar acessar rota protegida, redirecionar para login
  if (!session && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Se tiver sessão e tentar acessar login, redirecionar para dashboard
  if (session && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/api/:path*'
  ]
}