// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || 'ckfs-fallback-super-secret-key-32-chars-minimum'
);

// In-memory bucket for tracking request timestamps per IP during local dev
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string, limit = 5, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Prune timestamps older than the sliding window
  const recentTimestamps = timestamps.filter((time) => now - time < windowMs);

  if (recentTimestamps.length >= limit) {
    rateLimitMap.set(ip, recentTimestamps);
    return true;
  }

  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Explicit bypass for external webhooks (always unauthenticated & unthrottled)
  if (pathname.startsWith('/api/webhooks')) {
    return NextResponse.next();
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

  // 1. Rate Limit sensitive POST endpoints (Brute-force & spam mitigation)
  if (
    request.method === 'POST' &&
    (pathname === '/api/admin/login' || pathname === '/api/checkout/paymongo')
  ) {
    if (isRateLimited(ip, 5, 60 * 1000)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please wait a minute before trying again.',
        },
        { status: 429 }
      );
    }
  }

  // 2. Comprehensive Admin Protection (Pages & APIs)
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  if (isAdminPage || isAdminApi) {
    const token =
      request.cookies.get('ckfs_admin_token')?.value ||
      request.cookies.get('admin_session')?.value;

    const rejectUnauthorized = () => {
      if (isAdminApi) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Valid admin token required' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    };

    if (!token) {
      return rejectUnauthorized();
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (payload.role !== 'admin') {
        return rejectUnauthorized();
      }
      return NextResponse.next();
    } catch {
      return rejectUnauthorized();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/checkout/paymongo',
  ],
};