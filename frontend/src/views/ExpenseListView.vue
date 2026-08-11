<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useExpenseStore } from '../stores/expense';
import { useCategoryStore } from '../stores/category';

const router = useRouter();
const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();

const currentYear = new Date().getFullYear();
const filters = reactive({
  year: currentYear,
  month: '',
  expense_category_id: '',
  budget_category_id: '',
  page: 1,
  limit: 10,
});

function formatBaht(value) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value || 0);
}

function formatMonth(dateStr) {
  return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
}

async function loadExpenses() {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== null)
  );
  await expenseStore.fetchExpenses(cleanFilters);
}

onMounted(async () => {
  await categoryStore.fetchAll();
  await loadExpenses();
});

watch([() => filters.year, () => filters.month, () => filters.expense_category_id, () => filters.budget_category_id], () => {
  filters.page = 1;
  loadExpenses();
});
watch(() => filters.page, loadExpenses);

async function handleDelete(id) {
  if (!confirm('ยืนยันการลบรายการนี้หรือไม่?')) return;
  await expenseStore.deleteExpense(id);
  await loadExpenses();
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-800">รายการค่าใช้จ่าย</h2>
      <RouterLink
        to="/expenses/create"
        class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        + เพิ่มรายการ
      </RouterLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-gray-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      <select v-model.number="filters.year" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option v-for="y in [currentYear, currentYear - 1, currentYear - 2]" :key="y" :value="y">ปี {{ y }}</option>
      </select>
      <select v-model="filters.month" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option value="">ทุกเดือน</option>
        <option v-for="m in 12" :key="m" :value="m">เดือน {{ m }}</option>
      </select>
      <select v-model="filters.expense_category_id" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option value="">ทุกประเภท</option>
        <option v-for="c in categoryStore.expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select v-model="filters.budget_category_id" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
        <option value="">ทุกหมวดเงิน</option>
        <option v-for="c in categoryStore.budgetCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <table class="hidden md:table w-full text-sm bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <thead class="bg-gray-50 text-gray-500">
        <tr>
          <th class="text-left px-4 py-3 font-medium">เดือนบิล</th>
          <th class="text-left px-4 py-3 font-medium">ประเภท</th>
          <th class="text-left px-4 py-3 font-medium">หมวดเงิน</th>
          <th class="text-right px-4 py-3 font-medium">จำนวนเงิน</th>
          <th class="text-left px-4 py-3 font-medium">เลขที่ใบแจ้งหนี้</th>
          <th class="text-left px-4 py-3 font-medium">ไฟล์แนบ</th>
          <th class="text-right px-4 py-3 font-medium">จัดการ</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="e in expenseStore.expenses" :key="e.id" class="hover:bg-gray-50">
          <td class="px-4 py-3">{{ formatMonth(e.billing_month) }}</td>
          <td class="px-4 py-3">{{ e.expenseCategory?.name }}</td>
          <td class="px-4 py-3">{{ e.budgetCategory?.name }}</td>
          <td class="px-4 py-3 text-right font-medium">{{ formatBaht(e.amount) }}</td>
          <td class="px-4 py-3 text-gray-500">{{ e.invoice_no || '-' }}</td>
          <td class="px-4 py-3 text-gray-500">
            <a v-if="e.attachment_path" :href="`http://localhost:3000${e.attachment_path}`" target="_blank" class="text-primary-600 underline">เปิดไฟล์</a>
            <span v-else class="text-gray-400">-</span>
          </td>
          <td class="px-4 py-3 text-right space-x-2">
            <button @click="router.push(`/expenses/${e.id}/edit`)" class="text-primary-600 hover:underline">แก้ไข</button>
            <button @click="handleDelete(e.id)" class="text-red-500 hover:underline">ลบ</button>
          </td>
        </tr>
        <tr v-if="!expenseStore.expenses.length">
          <td colspan="7" class="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
        </tr>
      </tbody>
    </table>

    <div class="md:hidden space-y-3">
      <div
        v-for="e in expenseStore.expenses"
        :key="e.id"
        class="bg-white rounded-2xl border border-gray-200 p-4"
      >
        <div class="flex justify-between items-start mb-1">
          <span class="font-medium text-gray-800">{{ e.expenseCategory?.name }}</span>
          <span class="font-bold text-primary-700">{{ formatBaht(e.amount) }}</span>
        </div>
        <p class="text-xs text-gray-500">{{ formatMonth(e.billing_month) }} · {{ e.budgetCategory?.name }}</p>
        <p v-if="e.attachment_path" class="mt-2 text-xs">
          <a :href="`http://localhost:3000${e.attachment_path}`" target="_blank" class="text-primary-600 underline">เปิดไฟล์แนบ</a>
        </p>
        <div class="flex gap-3 mt-2 text-sm">
          <button @click="router.push(`/expenses/${e.id}/edit`)" class="text-primary-600">แก้ไข</button>
          <button @click="handleDelete(e.id)" class="text-red-500">ลบ</button>
        </div>
      </div>
      <p v-if="!expenseStore.expenses.length" class="text-center text-gray-400 py-8">ไม่พบข้อมูล</p>
    </div>

    <!-- Pagination -->
    <div v-if="expenseStore.pagination.totalPages > 1" class="flex justify-center items-center gap-2 text-sm">
      <button
        :disabled="filters.page <= 1"
        @click="filters.page--"
        class="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
      >ก่อนหน้า</button>
      <span class="text-gray-600">หน้า {{ filters.page }} / {{ expenseStore.pagination.totalPages }}</span>
      <button
        :disabled="filters.page >= expenseStore.pagination.totalPages"
        @click="filters.page++"
        class="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
      >ถัดไป</button>
    </div>
  </div>
</template>
