<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useExpenseStore } from '../stores/expense';
import SummaryCard from '../components/charts/SummaryCard.vue';
import BarChart from '../components/charts/BarChart.vue';
import PieChart from '../components/charts/PieChart.vue';

const expenseStore = useExpenseStore();

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatBaht(value) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value || 0);
}

async function loadData() {
  await Promise.all([
    expenseStore.fetchDashboardSummary(selectedYear.value),
    expenseStore.fetchByCategory(selectedYear.value),
    expenseStore.fetchByBudget(selectedYear.value),
  ]);
}

onMounted(loadData);
watch(selectedYear, loadData);

const barChartData = computed(() => ({
  labels: monthLabels,
  datasets: [
    {
      label: `ยอดค่าใช้จ่ายรายเดือน ปี ${selectedYear.value}`,
      backgroundColor: '#3b82f6',
      borderRadius: 6,
      data: expenseStore.dashboardSummary?.monthlyTotals.map((m) => m.total) || [],
    },
  ],
}));

const pieChartData = computed(() => ({
  labels: expenseStore.byCategory.map((c) => c.name),
  datasets: [
    {
      backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd', '#f59e0b', '#f87171', '#34d399', '#a78bfa'],
      data: expenseStore.byCategory.map((c) => c.total),
    },
  ],
}));

const budgetChartData = computed(() => {
  const uniqueBudgets = [...new Map(expenseStore.byBudget.map((item) => [item.name, item])).values()];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

  return {
    labels: monthLabels,
    datasets: uniqueBudgets.map((budget, index) => ({
      label: budget.name,
      backgroundColor: colors[index % colors.length],
      borderRadius: 4,
      stack: 'budget',
      data: Array.from({ length: 12 }, (_, monthIndex) => {
        const row = expenseStore.byBudget.find(
          (item) => item.name === budget.name && item.month === monthIndex + 1
        );
        return row ? Number(row.total) : 0;
      }),
    })),
  };
});

const budgetChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true },
    y: { stacked: true },
  },
}));
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-800">Dashboard</h2>
      <select v-model.number="selectedYear" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
        <option v-for="y in yearOptions" :key="y" :value="y">ปี {{ y }}</option>
      </select>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <SummaryCard
        label="ยอดรวมเดือนนี้"
        :value="formatBaht(expenseStore.dashboardSummary?.currentMonthTotal)"
        :change-percent="expenseStore.dashboardSummary?.changePercent"
        icon="📅"
      />
      <SummaryCard
        label="ยอดรวมเดือนก่อน"
        :value="formatBaht(expenseStore.dashboardSummary?.prevMonthTotal)"
        icon="⏮️"
      />
      <SummaryCard
        label="ยอดรวมปีนี้"
        :value="formatBaht(expenseStore.dashboardSummary?.yearTotal)"
        icon="📊"
      />
      <SummaryCard
        label="ประเภทค่าใช้จ่าย"
        :value="`${expenseStore.byCategory.length} รายการ`"
        icon="🗂️"
      />
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 lg:p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">ยอดค่าใช้จ่ายรายเดือน</h3>
        <BarChart :chart-data="barChartData" />
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">สัดส่วนตามประเภท</h3>
        <PieChart v-if="expenseStore.byCategory.length" :chart-data="pieChartData" />
        <p v-else class="text-sm text-gray-400 text-center py-10">ยังไม่มีข้อมูลในปีนี้</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">เปรียบเทียบตามหมวดเงิน</h3>
      <BarChart
        v-if="expenseStore.byBudget.length"
        :chart-data="budgetChartData"
        :chart-options="budgetChartOptions"
      />
      <p v-else class="text-sm text-gray-400 text-center py-10">ยังไม่มีข้อมูลหมวดเงินในปีนี้</p>
    </div>
  </div>
</template>
