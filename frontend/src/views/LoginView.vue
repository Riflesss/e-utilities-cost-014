<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const mode = ref('login');
const username = ref('');
const fullName = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const loading = ref(false);

const title = {
  login: 'เข้าสู่ระบบ',
  register: 'สร้างบัญชีผู้ใช้ใหม่',
};

const subtitle = {
  login: 'เข้าสู่ระบบเพื่อดำเนินการต่อ',
  register: 'กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้',
};

function resetForm() {
  errorMessage.value = '';
  username.value = '';
  fullName.value = '';
  password.value = '';
  confirmPassword.value = '';
}

async function handleSubmit() {
  errorMessage.value = '';
  loading.value = true;

  try {
    if (mode.value === 'register') {
      await authStore.register({
        username: username.value,
        password: password.value,
        full_name: fullName.value,
        confirmPassword: confirmPassword.value,
      });
      await authStore.login(username.value, password.value);
      const redirect = route.query.redirect || '/';
      router.push(redirect);
      return;
    }

    await authStore.login(username.value, password.value);
    const redirect = route.query.redirect || '/';
    router.push(redirect);
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">💧</div>
        <h1 class="text-xl font-bold text-gray-800">ระบบควบคุมค่าสาธารณูปโภค</h1>
        <p class="text-sm text-gray-500 mt-1">{{ subtitle[mode] }}</p>
      </div>

      <div class="mb-5 flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          @click="mode = 'login'; resetForm()"
          class="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
          :class="mode === 'login' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'"
        >
          เข้าสู่ระบบ
        </button>
        <button
          type="button"
          @click="mode = 'register'; resetForm()"
          class="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
          :class="mode === 'register' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'"
        >
          สร้างบัญชี
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="mode === 'register'">
          <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อเต็ม</label>
          <input
            v-model="fullName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="เช่น นางสาวสมหญิง ใจดี"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="username"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="••••••••"
          />
        </div>

        <div v-if="mode === 'register'">
          <label class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="กรอกรหัสผ่านซ้ำ"
          />
        </div>

        <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {{ loading ? 'กำลังดำเนินการ...' : title[mode] }}
        </button>
      </form>
    </div>
  </div>
</template>
