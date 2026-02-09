import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create Supabase client with cookie handling
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session }
  } = await supabase.auth.getSession();

  // Protect advisor routes - require valid session
  if (req.nextUrl.pathname.startsWith('/advisor')) {
    if (!session) {
      // Redirect to signin, but preserve the intended destination
      const redirectUrl = new URL('/auth/signin', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If user is signed in and tries to access auth pages, redirect to advisor
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/advisor', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/advisor/:path*', '/auth/:path*']
};
