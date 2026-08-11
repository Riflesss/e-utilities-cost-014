<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useExpenseStore } from '../stores/expense';
import { useCategoryStore } from '../stores/category';

const route = useRoute();
const router = useRouter();
const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const errorMessage = ref('');

const form = reactive({
  expense_category_id: '',
  budget_category_id: '',
  amount: '',
  billing_month: '',
  paid_date: '',
  invoice_no: '',
  note: '',
  attachmentFile: null,
  attachment_path: '',
});

onMounted(async () => {
  await categoryStore.fetchAll();

  if (isEdit.value) {
    const data = await expenseStore.getExpense(route.params.id);
    form.expense_category_id = data.expense_category_id;
    form.budget_category_id = data.budget_category_id;
    form.amount = data.amount;
    form.billing_month = data.billing_month;
    form.paid_date = data.paid_date || '';
    form.invoice_no = data.invoice_no || '';
    form.note = data.note || '';
    form.attachment_path = data.attachment_path || '';
  }
});

async function handleSubmit() {
  errorMessage.value = '';
  loading.value = true;
  try {
    if (isEdit.value) {
      await expenseStore.updateExpense(route.params.id, form);
    } else {
      await expenseStore.createExpense(form);
    }
    router.push('/expenses');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'บันทึกข้อมูลไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-xl">
    <h2 class="text-xl font-bold text-gray-800 mb-4">
      {{ isEdit ? 'แก้ไขรายการค่าใช้จ่าย' : 'เพิ่มรายการค่าใช้จ่าย' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ประเภทค่าใช้จ่าย *</label>
          <select v-model="form.expense_category_id" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="" disabled>เลือกประเภท</option>
            <option v-for="c in categoryStore.expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">หมวดเงินที่เบิก *</label>
          <select v-model="form.budget_category_id" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="" disabled>เลือกหมวดเงิน</option>
            <option v-for="c in categoryStore.budgetCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน (บาท) *</label>
          <input v-model.number="form.amount" type="number" step="0.01" min="0" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">เดือนของบิล *</label>
          <input v-model="form.billing_month" type="date" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่ชำระจริง</label>
          <input v-model="form.paid_date" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">เลขที่ใบแจ้งหนี้</label>
          <input v-model="form.invoice_no" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
        <textarea v-model="form.note" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ไฟล์แนบ</label>
        <input
          type="file"
          @change="(event) => { form.attachmentFile = event.target.files?.[0] || null; }"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700"
        />
        <p v-if="form.attachment_path" class="mt-2 text-xs text-gray-500">
          ไฟล์เดิม: <a :href="`http://localhost:3000${form.attachment_path}`" target="_blank" class="text-primary-600 underline">เปิดไฟล์</a>
        </p>
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {{ loading ? 'กำลังบันทึก...' : 'บันทึก' }}
        </button>
        <button
          type="button"
          @click="router.push('/expenses')"
          class="border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  </div>
</template>
