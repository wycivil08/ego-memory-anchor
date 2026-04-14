import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

const protectedPaths = ['/dashboard', '/profile', '/settings']
const authPaths = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabase = await createMiddlewareClient()

  // Refresh the session token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedPath = protectedPaths.some(
    (path) => pathname.startsWith(path) || pathname === path
  )
  const isAuthPath = authPaths.some((path) => pathname === path)

  // Unauthenticated user accessing protected routes -> redirect to login
  if (!user && isProtectedPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user accessing auth pages -> redirect to dashboard
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
