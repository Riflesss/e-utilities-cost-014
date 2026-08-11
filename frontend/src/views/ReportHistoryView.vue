<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useExpenseStore } from '../stores/expense';
import BarChart from '../components/charts/BarChart.vue';

const expenseStore = useExpenseStore();

const currentYear = new Date().getFullYear();
const year1 = ref(currentYear - 1);
const year2 = ref(currentYear);
const compareData = ref(null);
const loading = ref(false);

const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatBaht(value) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value || 0);
}

async function loadCompare() {
  loading.value = true;
  try {
    compareData.value = await expenseStore.fetchCompare(year1.value, year2.value);
  } finally {
    loading.value = false;
  }
}

onMounted(loadCompare);
watch([year1, year2], loadCompare);

const chartData = computed(() => {
  if (!compareData.value) return { labels: monthLabels, datasets: [] };
  return {
    labels: monthLabels,
    datasets: [
      {
        label: `ปี ${compareData.value.year1.year}`,
        backgroundColor: '#93c5fd',
        borderRadius: 6,
        data: compareData.value.year1.monthlyTotals,
      },
      {
        label: `ปี ${compareData.value.year2.year}`,
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        data: compareData.value.year2.monthlyTotals,
      },
    ],
  };
});
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold text-gray-800">รายงานย้อนหลัง / เปรียบเทียบปี</h2>

    <div class="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-end gap-4">
      <div>
        <label class="block text-xs text-gray-500 mb-1">ปีที่ 1</label>
        <select v-model.number="year1" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option v-for="y in [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]" :key="y" :value="y">ปี {{ y }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">ปีที่ 2</label>
        <select v-model.number="year2" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option v-for="y in [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]" :key="y" :value="y">ปี {{ y }}</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">เปรียบเทียบยอดค่าใช้จ่ายรายเดือน</h3>
      <BarChart v-if="compareData" :chart-data="chartData" />
    </div>

    <div v-if="compareData" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl border border-gray-200 p-4">
        <p class="text-sm text-gray-500">ยอดรวมปี {{ compareData.year1.year }}</p>
        <p class="text-2xl font-bold text-gray-800">{{ formatBaht(compareData.year1.total) }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-gray-200 p-4">
        <p class="text-sm text-gray-500">ยอดรวมปี {{ compareData.year2.year }}</p>
        <p class="text-2xl font-bold text-gray-800">{{ formatBaht(compareData.year2.total) }}</p>
      </div>
    </div>

    <div v-if="compareData" class="space-y-3">
      <table class="hidden md:table w-full text-sm min-w-[500px] bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3 font-medium">เดือน</th>
            <th class="text-right px-4 py-3 font-medium">ปี {{ compareData.year1.year }}</th>
            <th class="text-right px-4 py-3 font-medium">ปี {{ compareData.year2.year }}</th>
            <th class="text-right px-4 py-3 font-medium">ผลต่าง</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="(label, i) in monthLabels" :key="label" class="hover:bg-gray-50">
            <td class="px-4 py-2.5">{{ label }}</td>
            <td class="px-4 py-2.5 text-right">{{ formatBaht(compareData.year1.monthlyTotals[i]) }}</td>
            <td class="px-4 py-2.5 text-right">{{ formatBaht(compareData.year2.monthlyTotals[i]) }}</td>
            <td
              class="px-4 py-2.5 text-right"
              :class="compareData.year2.monthlyTotals[i] - compareData.year1.monthlyTotals[i] > 0 ? 'text-red-500' : 'text-green-600'"
            >
              {{ formatBaht(compareData.year2.monthlyTotals[i] - compareData.year1.monthlyTotals[i]) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="md:hidden space-y-3">
        <div v-for="(label, i) in monthLabels" :key="label" class="bg-white rounded-2xl border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <p class="font-medium text-gray-800">{{ label }}</p>
            <p class="text-sm" :class="compareData.year2.monthlyTotals[i] - compareData.year1.monthlyTotals[i] > 0 ? 'text-red-500' : 'text-green-600'">
              {{ formatBaht(compareData.year2.monthlyTotals[i] - compareData.year1.monthlyTotals[i]) }}
            </p>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <p class="text-gray-500">ปี {{ compareData.year1.year }}</p>
              <p class="font-medium text-gray-800">{{ formatBaht(compareData.year1.monthlyTotals[i]) }}</p>
            </div>
            <div>
              <p class="text-gray-500">ปี {{ compareData.year2.year }}</p>
              <p class="font-medium text-gray-800">{{ formatBaht(compareData.year2.monthlyTotals[i]) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
