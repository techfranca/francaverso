import { NextResponse } from 'next/server'

export function middleware(request) {
  // Middleware simples - a autenticação real é feita no client-side com localStorage
  // Este middleware pode ser expandido para autenticação mais robusta no futuro
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
