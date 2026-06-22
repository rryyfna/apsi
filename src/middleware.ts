import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecret_siakad_key');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('siakad_session')?.value;
  const path = request.nextUrl.pathname;

  // Halaman publik (Login)
  if (path === '/') {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        // Redirect jika sudah login
        if (payload.role === 'MAHASISWA') return NextResponse.redirect(new URL('/mahasiswa', request.url));
        if (payload.role === 'DOSEN') return NextResponse.redirect(new URL('/dosen', request.url));
        if (payload.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
        if (payload.role === 'KAPRODI') return NextResponse.redirect(new URL('/kaprodi', request.url));
        if (payload.role === 'MUTU') return NextResponse.redirect(new URL('/mutu', request.url));
      } catch {
        // Token tidak valid, biarkan di halaman login
      }
    }
    return NextResponse.next();
  }

  // Lindungi rute /mahasiswa, /dosen, /admin, /kaprodi, /mutu
  if (path.startsWith('/mahasiswa') || path.startsWith('/dosen') || path.startsWith('/admin') || path.startsWith('/kaprodi') || path.startsWith('/mutu')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Validasi Role
      if (path.startsWith('/mahasiswa') && payload.role !== 'MAHASISWA') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (path.startsWith('/dosen') && payload.role !== 'DOSEN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (path.startsWith('/admin') && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (path.startsWith('/kaprodi') && payload.role !== 'KAPRODI') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (path.startsWith('/mutu') && payload.role !== 'MUTU') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Clone request headers to append user info
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.id as string);
      requestHeaders.set('x-user-role', payload.role as string);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      });
    } catch {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/mahasiswa/:path*', '/dosen/:path*', '/admin/:path*', '/kaprodi/:path*', '/mutu/:path*'],
};
