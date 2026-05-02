import { NextResponse, type NextRequest } from 'next/server';

const ROLE_HOME: Record<'admin' | 'parent' | 'teacher', string> = {
  admin: '/admin',
  teacher: '/teacher/attendance',
  parent: '/parent/scores',
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

const getUserRole = async (req: NextRequest): Promise<AuthRole | null> => {
  const cookie = req.headers.get('cookie') ?? '';

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
    return data.role ?? null;
  }

  if (profileRes.status !== 401) {
    return null;
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
    return null;
  }

  const refreshData = (await refreshRes.json()) as RefreshResponse;
  return refreshData.user?.role ?? null;
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginRoute = pathname === '/login';
  const isAdminRoute = pathname.startsWith('/admin');
  const isTeacherRoute = pathname.startsWith('/teacher');
  const isParentRoute = pathname.startsWith('/parent');

  if (!isLoginRoute && !isAdminRoute && !isTeacherRoute && !isParentRoute) {
    return NextResponse.next();
  }

  const role = await getUserRole(req);

  if (!role) {
    if (isLoginRoute) {
      return withNoStore(NextResponse.next());
    }

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return withNoStore(NextResponse.redirect(loginUrl));
  }

  if (isLoginRoute) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = ROLE_HOME[role];
    return withNoStore(NextResponse.redirect(homeUrl));
  }

  const expectedRole: AuthRole | null = isAdminRoute
    ? 'admin'
    : isTeacherRoute
      ? 'teacher'
      : isParentRoute
        ? 'parent'
        : null;

  if (expectedRole && role !== expectedRole) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = ROLE_HOME[role];
    return withNoStore(NextResponse.redirect(homeUrl));
  }

  return withNoStore(NextResponse.next());
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/parent/:path*', '/login'],
};
