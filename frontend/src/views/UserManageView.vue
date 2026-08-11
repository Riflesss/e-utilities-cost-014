<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const authStore = useAuthStore();

const currentUserId = computed(() => authStore.user?.id);

onMounted(() => {
  userStore.fetchUsers();
});

async function updateRole(userId, role) {
  await userStore.updateUserRole(userId, role);
}

async function deleteUser(userId) {
  if (Number(currentUserId.value) === Number(userId)) {
    alert('ไม่สามารถลบบัญชีตัวเองได้');
    return;
  }

  if (!confirm('ยืนยันการลบผู้ใช้นี้หรือไม่?')) return;
  await userStore.deleteUser(userId);
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-800">จัดการผู้ใช้</h2>
      <span class="text-sm text-gray-500">{{ userStore.users.length }} รายการ</span>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div v-if="userStore.loading" class="p-6 text-sm text-gray-500">กำลังโหลดข้อมูล...</div>

      <table v-else class="hidden md:table w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3 font-medium">ชื่อผู้ใช้</th>
            <th class="text-left px-4 py-3 font-medium">ชื่อเต็ม</th>
            <th class="text-left px-4 py-3 font-medium">บทบาท</th>
            <th class="text-right px-4 py-3 font-medium">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="user in userStore.users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">{{ user.username }}</td>
            <td class="px-4 py-3 text-gray-600">{{ user.full_name || '-' }}</td>
            <td class="px-4 py-3">
              <select
                :value="user.role"
                @change="updateRole(user.id, $event.target.value)"
                class="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                :disabled="Number(currentUserId) === Number(user.id)"
              >
                <option value="staff">staff</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="Number(currentUserId) !== Number(user.id)"
                @click="deleteUser(user.id)"
                class="text-red-500 hover:underline"
              >
                ลบ
              </button>
              <span v-else class="text-gray-400">-</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!userStore.loading" class="md:hidden space-y-3 p-3">
        <div v-for="user in userStore.users" :key="user.id" class="border border-gray-200 rounded-xl p-4 space-y-2">
          <div class="flex justify-between items-start gap-3">
            <div>
              <p class="font-medium text-gray-800">{{ user.username }}</p>
              <p class="text-xs text-gray-500">{{ user.full_name || '-' }}</p>
            </div>
            <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{{ user.role }}</span>
          </div>

          <div class="flex items-center justify-between gap-3">
            <select
              :value="user.role"
              @change="updateRole(user.id, $event.target.value)"
              class="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              :disabled="Number(currentUserId) === Number(user.id)"
            >
              <option value="staff">staff</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div class="text-right">
            <button
              v-if="Number(currentUserId) !== Number(user.id)"
              @click="deleteUser(user.id)"
              class="text-red-500 text-sm"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
