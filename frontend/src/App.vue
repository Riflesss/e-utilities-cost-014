<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/layout/Sidebar.vue';
import Navbar from './components/layout/Navbar.vue';
import MobileMenu from './components/layout/MobileMenu.vue';

const route = useRoute();
const isPublicPage = computed(() => route.meta.public); // หน้า login ไม่ต้องมี layout
</script>

<template>
  <!-- หน้า login: แสดงเดี่ยวๆ ไม่มี sidebar/navbar -->
  <RouterView v-if="isPublicPage" />

  <!-- หน้าอื่นๆ ทั้งหมด: มี layout เต็มรูปแบบ responsive -->
  <div v-else class="flex min-h-screen">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <Navbar />
      <main class="flex-1 p-4 lg:p-6 pb-20 md:pb-6">
        <RouterView />
      </main>
    </div>
    <MobileMenu />
  </div>
</template>
