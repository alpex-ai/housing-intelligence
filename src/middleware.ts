import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  // Protect advisor routes
  if (req.nextUrl.pathname.startsWith('/advisor')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/advisor/:path*', '/auth/:path*']
};
