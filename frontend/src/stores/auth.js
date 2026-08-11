import { defineStore } from 'pinia';
import axios from 'axios';
import authService from '../services/auth.service';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null, // เก็บใน memory เท่านั้น ไม่เก็บ localStorage เพื่อลดความเสี่ยง XSS
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async register({ username, password, full_name, confirmPassword }) {
      const { data } = await authService.register({ username, password, full_name, confirmPassword });
      return data;
    },

    async login(username, password) {
      const { data } = await authService.login(username, password);
      this.accessToken = data.accessToken;
      this.user = data.user;
      return data;
    },

    async logout() {
      try {
        await authService.logout();
      } finally {
        this.accessToken = null;
        this.user = null;
      }
    },

    // เรียกตอนเปิดแอปครั้งแรก เพื่อเช็คว่ามี session (refreshToken cookie) เดิมอยู่ไหม
    async tryRestoreSession() {
      try {
        await this.refreshAccessToken();
        const { data } = await authService.me();
        this.user = data;
        return true;
      } catch {
        this.accessToken = null;
        this.user = null;
        return false;
      }
    },

    // ใช้ axios ตรงๆ (ไม่ใช้ instance api.js) เพื่อเลี่ยง interceptor loop ตอน refresh
    async refreshAccessToken() {
      const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
      this.accessToken = data.accessToken;
      return data.accessToken;
    },

    forceLogout() {
      this.accessToken = null;
      this.user = null;
      window.location.href = '/login';
    },
  },
});
