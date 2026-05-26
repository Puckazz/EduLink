import { NextResponse, type NextRequest } from 'next/server';

/**
 * Lightweight middleware — NO server-side auth checks.
 * Auth is handled client-side by <AuthGuard>.
 * 
 * Middleware chỉ đảm bảo:
 *  - Cache headers (no-store) cho các protected routes
 */

const withNoStore = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('x-middleware-cache', 'no-cache');
  return response;
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const lowerPathname = pathname.toLowerCase();

  const isProtectedRoute =
    lowerPathname.startsWith('/admin') ||
    lowerPathname.startsWith('/teacher') ||
    lowerPathname.startsWith('/parent');

  const isLoginRoute = lowerPathname === '/login';

  if (isProtectedRoute || isLoginRoute) {
    return withNoStore(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
