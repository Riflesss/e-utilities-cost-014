import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // ให้ browser ส่ง httpOnly cookie (refreshToken) ไปด้วย
});

// แนบ accessToken จาก store ไปกับทุก request
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

// ถ้า accessToken หมดอายุ (401) ให้ลอง refresh แล้ว retry request เดิมอัตโนมัติ
let isRefreshing = false;
let pendingRequests = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      if (isRefreshing) {
        // ถ้ากำลัง refresh อยู่ ให้รอคิว แล้วค่อย retry ทีหลัง
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await authStore.refreshAccessToken();
        pendingRequests.forEach((p) => p.resolve());
        pendingRequests = [];
        return api(originalRequest);
      } catch (refreshError) {
        pendingRequests.forEach((p) => p.reject(refreshError));
        pendingRequests = [];
        authStore.forceLogout(); // refresh ไม่สำเร็จ → เด้งกลับหน้า login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
