<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const menuItems = [
  { name: 'dashboard', label: 'Dashboard', path: '/', icon: '📊' },
  { name: 'expenses', label: 'รายการค่าใช้จ่าย', path: '/expenses', icon: '💰' },
  { name: 'expense-category-manage', label: 'จัดการหมวดหมู่', path: '/settings/expense-categories', icon: '⚙️', adminOnly: true },
  { name: 'user-manage', label: 'ผู้ใช้', path: '/settings/users', icon: '👥', adminOnly: true },
  { name: 'reports', label: 'รายงานย้อนหลัง', path: '/reports', icon: '📈' },
].filter((item) => !item.adminOnly || authStore.user?.role === 'admin');
</script>

<template>
  <!-- Mobile: bottom navigation แสดงเฉพาะจอเล็กกว่า md -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-20">
    <RouterLink
      v-for="item in menuItems"
      :key="item.name"
      :to="item.path"
      class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs"
      :class="route.name === item.name ? 'text-primary-600' : 'text-gray-500'"
    >
      <span class="text-lg">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
