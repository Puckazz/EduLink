import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

let isRefreshing = false;
let pendingRequests: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const releasePendingRequests = () => {
  pendingRequests.forEach(({ resolve }) => resolve());
  pendingRequests = [];
};

const rejectPendingRequests = (error: unknown) => {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url || '';
    
    const isPublicAuthEndpoint =
      requestUrl.startsWith('/auth/login') ||
      requestUrl.startsWith('/auth/refresh') ||
      requestUrl.startsWith('/auth/request-otp') ||
      requestUrl.startsWith('/auth/verify-otp') ||
      requestUrl.startsWith('/auth/set-password') ||
      requestUrl.startsWith('/auth/forgot-password');

    // Skip auto-redirect if caller opts out (used by AuthGuard/GuestGuard)
    const skipRedirect = originalRequest?._skipAuthRedirect === true;

    if (
      error.response?.status === 401 &&
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
