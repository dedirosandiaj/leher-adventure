import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
  const token = request.cookies.get('admin_session')?.value;
  
  // Protect /portal-leher routes
  if (request.nextUrl.pathname.startsWith('/portal-leher')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login-leher', request.url));
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      // Token exists but is invalid
      const response = NextResponse.redirect(new URL('/login-leher', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  // If already logged in, redirect away from login page
  if (request.nextUrl.pathname.startsWith('/login-leher')) {
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/portal-leher', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal-leher/:path*', '/login-leher'],
};
