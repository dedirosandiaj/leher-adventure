import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
  const adminToken = request.cookies.get('admin_session')?.value;
  const memberId = request.cookies.get('memberId')?.value;
  
  // Protect /portal-leher routes (admin only)
  if (request.nextUrl.pathname.startsWith('/portal-leher')) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/login-leher', request.url));
    }
    
    const payload = await verifyToken(adminToken);
    if (!payload) {
      // Token exists but is invalid
      const response = NextResponse.redirect(new URL('/login-leher', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  // Protect /portal-member routes (member only)
  if (request.nextUrl.pathname.startsWith('/portal-member')) {
    if (!memberId) {
      return NextResponse.redirect(new URL('/login-member', request.url));
    }
  }

  // If already logged in as admin, redirect away from admin login page
  if (request.nextUrl.pathname.startsWith('/login-leher')) {
    if (adminToken) {
      const payload = await verifyToken(adminToken);
      if (payload) {
        return NextResponse.redirect(new URL('/portal-leher', request.url));
      }
    }
  }

  // If already logged in as member, redirect away from member login page
  if (request.nextUrl.pathname === '/login-member') {
    if (memberId) {
      return NextResponse.redirect(new URL('/portal-member', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal-leher/:path*', '/portal-member/:path*', '/login-leher', '/login-member'],
};
