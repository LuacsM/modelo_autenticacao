import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const loginUrl = new URL('/login', req.url);

  if (req.nextUrl.pathname === '/') {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(loginUrl);
    }

    try {
      const res = await fetch(`${req.nextUrl.origin}/api/auth/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (res.status !== 200) {
        return NextResponse.redirect(loginUrl);
      }

      const { valid } = await res.json();

      if (!valid) {
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'], // Protege apenas a rota '/'
};
