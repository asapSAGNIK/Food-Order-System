import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Public paths
  if (path.startsWith('/login')) {
    if (token) {
      return NextResponse.redirect(new URL('/restaurants', request.url));
    }
    return NextResponse.next();
  }

  // Protected paths
  if (path === '/') {
    return NextResponse.redirect(new URL('/restaurants', request.url));
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded: any = jwtDecode(token);
    const role = decoded.role;

    // RBAC check for frontend
    if (path.startsWith('/settings/payment') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/restaurants', request.url));
    }

  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
