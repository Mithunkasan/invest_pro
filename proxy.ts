import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './lib/auth'

// Routes that require user authentication
const protectedUserRoutes = ['/dashboard']

// Routes that require admin authentication
const protectedAdminRoutes = ['/admin/dashboard']

// Auth pages (redirect to dashboard if already logged in)
const authRoutes = ['/login', '/register', '/forgot-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Check Admin Routes ─────────────────────────────────────
  if (protectedAdminRoutes.some((route) => pathname.startsWith(route))) {
    const adminToken = request.cookies.get('investpro_admin_token')?.value

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    const payload = await verifyToken(adminToken)
    if (!payload || payload.type !== 'admin') {
      const response = NextResponse.redirect(new URL('/admin', request.url))
      response.cookies.set('investpro_admin_token', '', { maxAge: 0 })
      return response
    }

    return NextResponse.next()
  }

  // ── Check User Routes ──────────────────────────────────────
  if (protectedUserRoutes.some((route) => pathname.startsWith(route))) {
    const userToken = request.cookies.get('investpro_token')?.value

    if (!userToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = await verifyToken(userToken)
    if (!payload || payload.type !== 'user') {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.set('investpro_token', '', { maxAge: 0 })
      return response
    }

    return NextResponse.next()
  }

  // ── Redirect authenticated users away from auth pages ──────
  if (authRoutes.includes(pathname)) {
    const userToken = request.cookies.get('investpro_token')?.value
    if (userToken) {
      const payload = await verifyToken(userToken)
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
}
