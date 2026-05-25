import { NextResponse, type NextRequest } from 'next/server';

const ROLE_HOME: Record<'admin' | 'parent' | 'teacher', string> = {
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
};

type AuthRole = keyof typeof ROLE_HOME;

type AuthProfileResponse = {
  role: AuthRole;
};

type RefreshResponse = {
  user?: {
    role?: AuthRole;
  };
};

const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const withNoStore = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('x-middleware-cache', 'no-cache');
  return response;
};

type GetUserRoleResult = {
  role: AuthRole | null;
  cookiesToSet?: string[];
};

const getUserRole = async (req: NextRequest): Promise<GetUserRoleResult> => {
  const cookie = req.headers.get('cookie') ?? '';

  try {
    const profileRes = await fetch(`${getApiBaseUrl()}/auth/profile`, {
      method: 'GET',
      headers: {
        cookie,
        accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (profileRes.ok) {
      const data = (await profileRes.json()) as AuthProfileResponse;
      return { role: data.role ?? null };
    }

    if (profileRes.status !== 401) {
      return { role: null };
    }

    const refreshRes = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: {
        cookie,
        accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!refreshRes.ok) {
      return { role: null };
    }

    const setCookieHeaders = refreshRes.headers.getSetCookie();

    const refreshData = (await refreshRes.json()) as RefreshResponse;
    return { 
      role: refreshData.user?.role ?? null,
      cookiesToSet: setCookieHeaders
    };
  } catch (error) {
    console.error('Middleware auth check failed (backend might be offline):', error);
    return { role: null };
  }
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const lowerPathname = pathname.toLowerCase();

  const isLoginRoute = lowerPathname === '/login';
  const isAdminRoute = lowerPathname.startsWith('/admin');
  const isTeacherRoute = lowerPathname.startsWith('/teacher');
  const isParentRoute = lowerPathname.startsWith('/parent');

  if (!isLoginRoute && !isAdminRoute && !isTeacherRoute && !isParentRoute) {
    return NextResponse.next();
  }

  const { role, cookiesToSet } = await getUserRole(req);

  const applyCookiesAndNoStore = (res: NextResponse) => {
    if (cookiesToSet && cookiesToSet.length > 0) {
      cookiesToSet.forEach(c => res.headers.append('Set-Cookie', c));
    }
    return withNoStore(res);
  };

  if (!role) {
    if (isLoginRoute) {
      return applyCookiesAndNoStore(NextResponse.next());
    }

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return applyCookiesAndNoStore(NextResponse.redirect(loginUrl));
  }

  if (isLoginRoute) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = ROLE_HOME[role];
    return applyCookiesAndNoStore(NextResponse.redirect(homeUrl));
  }

  const expectedRole: AuthRole = isAdminRoute
    ? 'admin'
    : isTeacherRoute
      ? 'teacher'
      : 'parent';

  if (role !== expectedRole) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = ROLE_HOME[role];
    return applyCookiesAndNoStore(NextResponse.redirect(homeUrl));
  }

  return applyCookiesAndNoStore(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
