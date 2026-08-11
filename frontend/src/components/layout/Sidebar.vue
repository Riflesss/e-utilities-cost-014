<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const menuItems = [
  { name: 'dashboard', label: 'Dashboard', path: '/', icon: '📊' },
  { name: 'expenses', label: 'รายการค่าใช้จ่าย', path: '/expenses', icon: '💰' },
  { name: 'expense-category-manage', label: 'จัดการหมวดหมู่', path: '/settings/expense-categories', icon: '⚙️', adminOnly: true },
  { name: 'user-manage', label: 'จัดการผู้ใช้', path: '/settings/users', icon: '👥', adminOnly: true },
  { name: 'reports', label: 'รายงานย้อนหลัง', path: '/reports', icon: '📈' },
].filter((item) => !item.adminOnly || authStore.user?.role === 'admin');
</script>

<template>
  <!-- Desktop/Tablet: fixed sidebar ซ้ายมือ, ยุบเหลือไอคอนบนจอเล็กกว่า lg -->
  <aside class="hidden md:flex md:flex-col md:w-16 lg:w-64 bg-white border-r border-gray-200 h-screen sticky top-0 shrink-0 transition-all">
    <div class="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-200">
      <span class="text-xl">💧</span>
      <span class="hidden lg:inline ml-2 font-bold text-primary-700">Utility Cost</span>
    </div>

    <nav class="flex-1 py-4 space-y-1">
      <RouterLink
        v-for="item in menuItems"
        :key="item.name"
        :to="item.path"
        class="flex items-center justify-center lg:justify-start gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :class="route.name === item.name
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100'"
      >
        <span class="text-lg">{{ item.icon }}</span>
        <span class="hidden lg:inline">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
