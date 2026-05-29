import axios from 'axios';
import type { AxiosResponse } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _skipAuthRedirect?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    _skipAuthRedirect?: boolean;
    _retry?: boolean;
  }
}

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
const shouldUseApiProxy =
  process.env.NODE_ENV === 'production' &&
  configuredApiUrl &&
  process.env.NEXT_PUBLIC_BYPASS_API_PROXY !== 'true';

const apiClient = axios.create({
  baseURL: shouldUseApiProxy
    ? '/api/backend'
    : configuredApiUrl ?? 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

let isRefreshing = false;
let isEndingAuthSession = false;
let pendingRequests: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

export const beginAuthSessionEnd = () => {
  isEndingAuthSession = true;
};

export const endAuthSessionEnd = () => {
  isEndingAuthSession = false;
};

export const isAuthSessionEnding = () => isEndingAuthSession;

const releasePendingRequests = () => {
  pendingRequests.forEach(({ resolve }) => resolve());
  pendingRequests = [];
};

const rejectPendingRequests = (error: unknown) => {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = [];
};

type ApiEnvelope = {
  success: boolean;
  statusCode: number;
  timestamp: string;
  path: string;
  message?: string;
  data?: unknown;
  meta?: unknown;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isApiEnvelope = (value: unknown): value is ApiEnvelope =>
  isPlainObject(value) &&
  typeof value.success === 'boolean' &&
  typeof value.statusCode === 'number' &&
  'timestamp' in value &&
  'path' in value;

const isPaginationMeta = (value: unknown) =>
  isPlainObject(value) &&
  ('total_pages' in value || 'has_prev' in value || 'has_next' in value);

const unwrapApiEnvelope = (payload: unknown) => {
  if (!isApiEnvelope(payload) || payload.success !== true) {
    return payload;
  }

  const { data = null, message, meta } = payload;

  if (meta !== undefined) {
    const metadataKey = isPaginationMeta(meta) ? 'pagination' : 'meta';

    if (isPlainObject(data)) {
      return {
        ...(message ? { message } : {}),
        ...data,
        [metadataKey]: meta,
      };
    }

    return {
      ...(message ? { message } : {}),
      data,
      [metadataKey]: meta,
    };
  }

  if (message) {
    if (isPlainObject(data)) {
      return { message, ...data };
    }

    return data === null ? { message } : { message, data };
  }

  return data;
};

const unwrapResponse = (response: AxiosResponse) => {
  response.data = unwrapApiEnvelope(response.data);
  return response;
};

apiClient.interceptors.response.use(
  unwrapResponse,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url || '';
    
    const isPublicAuthEndpoint =
      requestUrl.startsWith('/auth/login') ||
      requestUrl.startsWith('/auth/refresh') ||
      requestUrl.startsWith('/auth/logout') ||
      requestUrl.startsWith('/auth/request-otp') ||
      requestUrl.startsWith('/auth/verify-otp') ||
      requestUrl.startsWith('/auth/set-password') ||
      requestUrl.startsWith('/auth/forgot-password');

    // Skip auto-redirect if caller opts out (used by AuthGuard/GuestGuard)
    const skipRedirect = originalRequest?._skipAuthRedirect === true;

    if (
      error.response?.status === 401 &&
      !isEndingAuthSession &&
      !isPublicAuthEndpoint &&
      !originalRequest?._retry &&
      !skipRedirect
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        await new Promise<void>((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        });
        return apiClient(originalRequest);
      }

      isRefreshing = true;

      try {
        await apiClient.post('/auth/refresh');
        releasePendingRequests();
        return apiClient(originalRequest);
      } catch (refreshError) {
        rejectPendingRequests(refreshError);
        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/login'
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
