<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

async function handleLogout() {
  await authStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
    <h1 class="text-lg font-semibold text-gray-800 md:hidden">💧 Utility Cost</h1>
    <div class="hidden md:block"></div>

    <div class="flex items-center gap-3">
      <span class="text-sm text-gray-600 hidden sm:inline">
        สวัสดี, {{ authStore.user?.full_name || authStore.user?.username }}
      </span>
      <button
        @click="handleLogout"
        class="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        ออกจากระบบ
      </button>
    </div>
  </header>
</template>
