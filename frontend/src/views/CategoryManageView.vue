<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useCategoryStore } from '../stores/category';

const route = useRoute();
const categoryStore = useCategoryStore();
const activeTab = ref('expense'); // 'expense' | 'budget'

const expenseForm = reactive({ id: null, name: '', code: '', unit: 'บาท' });
const budgetForm = reactive({ id: null, name: '', code: '' });
const errorMessage = ref('');

onMounted(() => categoryStore.fetchAll());

watch(
  () => route.name,
  (name) => {
    activeTab.value = name === 'budget-category-manage' ? 'budget' : 'expense';
  },
  { immediate: true }
);

function resetExpenseForm() {
  expenseForm.id = null;
  expenseForm.name = '';
  expenseForm.code = '';
  expenseForm.unit = 'บาท';
}

function resetBudgetForm() {
  budgetForm.id = null;
  budgetForm.name = '';
  budgetForm.code = '';
}

function editExpense(item) {
  expenseForm.id = item.id;
  expenseForm.name = item.name;
  expenseForm.code = item.code;
  expenseForm.unit = item.unit;
}

function editBudget(item) {
  budgetForm.id = item.id;
  budgetForm.name = item.name;
  budgetForm.code = item.code;
}

async function submitExpense() {
  errorMessage.value = '';
  try {
    if (expenseForm.id) {
      await categoryStore.updateExpenseCategory(expenseForm.id, expenseForm);
    } else {
      await categoryStore.createExpenseCategory(expenseForm);
    }
    resetExpenseForm();
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'บันทึกไม่สำเร็จ';
  }
}

async function submitBudget() {
  errorMessage.value = '';
  try {
    if (budgetForm.id) {
      await categoryStore.updateBudgetCategory(budgetForm.id, budgetForm);
    } else {
      await categoryStore.createBudgetCategory(budgetForm);
    }
    resetBudgetForm();
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'บันทึกไม่สำเร็จ';
  }
}

async function deleteExpense(id) {
  if (!confirm('ยืนยันการลบประเภทค่าใช้จ่ายนี้หรือไม่?')) return;
  await categoryStore.deleteExpenseCategory(id);
}

async function deleteBudget(id) {
  if (!confirm('ยืนยันการลบหมวดเงินนี้หรือไม่?')) return;
  await categoryStore.deleteBudgetCategory(id);
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold text-gray-800">จัดการหมวดหมู่</h2>

    <!-- Tabs -->
    <div class="flex gap-2 border-b border-gray-200">
      <button
        @click="activeTab = 'expense'"
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
        :class="activeTab === 'expense' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500'"
      >
        ประเภทค่าใช้จ่าย
      </button>
      <button
        @click="activeTab = 'budget'"
        class="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
        :class="activeTab === 'budget' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500'"
      >
        หมวดเงิน
      </button>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <!-- ===== Expense Categories ===== -->
    <div v-if="activeTab === 'expense'" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <form @submit.prevent="submitExpense" class="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 h-fit">
        <h3 class="text-sm font-semibold text-gray-700">{{ expenseForm.id ? 'แก้ไข' : 'เพิ่ม' }}ประเภทค่าใช้จ่าย</h3>
        <div>
          <label class="block text-xs text-gray-500 mb-1">ชื่อ</label>
          <input v-model="expenseForm.name" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="เช่น ค่าไฟฟ้า" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">รหัส</label>
          <input v-model="expenseForm.code" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="เช่น ELEC" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">หน่วย</label>
          <input v-model="expenseForm.unit" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div class="flex gap-2">
          <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            {{ expenseForm.id ? 'บันทึกการแก้ไข' : 'เพิ่ม' }}
          </button>
          <button v-if="expenseForm.id" type="button" @click="resetExpenseForm" class="text-sm text-gray-500 px-3">ยกเลิก</button>
        </div>
      </form>

      <div class="lg:col-span-2">
        <table class="hidden md:table w-full text-sm bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <thead class="bg-gray-50 text-gray-500">
            <tr>
              <th class="text-left px-4 py-3 font-medium">ชื่อ</th>
              <th class="text-left px-4 py-3 font-medium">รหัส</th>
              <th class="text-left px-4 py-3 font-medium">หน่วย</th>
              <th class="text-right px-4 py-3 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="c in categoryStore.expenseCategories" :key="c.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ c.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ c.code }}</td>
              <td class="px-4 py-3 text-gray-500">{{ c.unit }}</td>
              <td class="px-4 py-3 text-right space-x-2">
                <button @click="editExpense(c)" class="text-primary-600 hover:underline">แก้ไข</button>
                <button @click="deleteExpense(c.id)" class="text-red-500 hover:underline">ลบ</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="md:hidden space-y-3">
          <div v-for="c in categoryStore.expenseCategories" :key="c.id" class="bg-white rounded-2xl border border-gray-200 p-4">
            <div class="flex justify-between items-start mb-1">
              <div>
                <p class="font-medium text-gray-800">{{ c.name }}</p>
                <p class="text-xs text-gray-500">{{ c.code }} · {{ c.unit }}</p>
              </div>
              <div class="flex gap-2 text-sm">
                <button @click="editExpense(c)" class="text-primary-600">แก้ไข</button>
                <button @click="deleteExpense(c.id)" class="text-red-500">ลบ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Budget Categories ===== -->
    <div v-if="activeTab === 'budget'" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <form @submit.prevent="submitBudget" class="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 h-fit">
        <h3 class="text-sm font-semibold text-gray-700">{{ budgetForm.id ? 'แก้ไข' : 'เพิ่ม' }}หมวดเงิน</h3>
        <div>
          <label class="block text-xs text-gray-500 mb-1">ชื่อ</label>
          <input v-model="budgetForm.name" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="เช่น งบประมาณ (ปวช.)" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">รหัส</label>
          <input v-model="budgetForm.code" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="เช่น BUDGET_PVC" />
        </div>
        <div class="flex gap-2">
          <button type="submit" class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            {{ budgetForm.id ? 'บันทึกการแก้ไข' : 'เพิ่ม' }}
          </button>
          <button v-if="budgetForm.id" type="button" @click="resetBudgetForm" class="text-sm text-gray-500 px-3">ยกเลิก</button>
        </div>
      </form>

      <div class="lg:col-span-2">
        <table class="hidden md:table w-full text-sm bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <thead class="bg-gray-50 text-gray-500">
            <tr>
              <th class="text-left px-4 py-3 font-medium">ชื่อ</th>
              <th class="text-left px-4 py-3 font-medium">รหัส</th>
              <th class="text-right px-4 py-3 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="c in categoryStore.budgetCategories" :key="c.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ c.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ c.code }}</td>
              <td class="px-4 py-3 text-right space-x-2">
                <button @click="editBudget(c)" class="text-primary-600 hover:underline">แก้ไข</button>
                <button @click="deleteBudget(c.id)" class="text-red-500 hover:underline">ลบ</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="md:hidden space-y-3">
          <div v-for="c in categoryStore.budgetCategories" :key="c.id" class="bg-white rounded-2xl border border-gray-200 p-4">
            <div class="flex justify-between items-start mb-1">
              <div>
                <p class="font-medium text-gray-800">{{ c.name }}</p>
                <p class="text-xs text-gray-500">{{ c.code }}</p>
              </div>
              <div class="flex gap-2 text-sm">
                <button @click="editBudget(c)" class="text-primary-600">แก้ไข</button>
                <button @click="deleteBudget(c.id)" class="text-red-500">ลบ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
