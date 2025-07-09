import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting store (in production, use Redis)
const rateLimit = new Map();

function rateLimiter(ip: string, limit: number = 100, window: number = 900000) {
  const now = Date.now();
  const windowStart = now - window;
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const requests = rateLimit.get(ip).filter((time: number) => time > windowStart);
  
  if (requests.length >= limit) {
    return false;
  }
  
  requests.push(now);
  rateLimit.set(ip, requests);
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for Socket.io
  if (pathname.startsWith('/api/socket')) {
    return NextResponse.next();
  }
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || 'unknown';
    const limit = parseInt(process.env.RATE_LIMIT_MAX || '100');
    const window = parseInt(process.env.RATE_LIMIT_WINDOW || '900000');
    
    if (!rateLimiter(ip, limit, window)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }
  
  // Authentication protection
  const protectedPaths = [
    '/dashboard',
    '/mentor-dashboard', 
    '/admin',
  ];
  
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );
  
  if (isProtectedPath) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    // Role-based access control
    const userRole = token.role as string;
    
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/dashboard', request.url));
    }
    
    if (pathname.startsWith('/mentor-dashboard') && !['mentor', 'admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard/dashboard', request.url));
    }
  }
  
  // Age restriction middleware for story creation
  if (pathname.startsWith('/dashboard/create-stories')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (token) {
      const userAge = token.age as number;
      const minAge = parseInt(process.env.MIN_AGE || '2');
      const maxAge = parseInt(process.env.MAX_AGE || '18');
      
      if (userAge < minAge || userAge > maxAge) {
        return NextResponse.redirect(new URL('/dashboard/dashboard', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/mentor-dashboard/:path*',
    '/admin/:path*',
  ],
};