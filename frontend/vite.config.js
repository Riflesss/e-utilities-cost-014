import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true, // ให้เข้าถึงได้จากมือถือ/แท็บเล็ตในวง LAN เดียวกันตอน dev
  },
});
