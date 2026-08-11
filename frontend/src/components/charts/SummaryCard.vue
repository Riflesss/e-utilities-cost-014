<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  changePercent: { type: [String, Number, null], default: null },
  icon: { type: String, default: '💵' },
});
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-4 lg:p-5">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm text-gray-500">{{ label }}</span>
      <span class="text-xl">{{ icon }}</span>
    </div>
    <div class="text-2xl font-bold text-gray-800">{{ value }}</div>
    <div
      v-if="changePercent !== null && changePercent !== undefined"
      class="text-xs mt-1"
      :class="Number(changePercent) >= 0 ? 'text-red-500' : 'text-green-600'"
    >
      {{ Number(changePercent) >= 0 ? '▲' : '▼' }} {{ Math.abs(Number(changePercent)) }}% เทียบเดือนก่อน
    </div>
  </div>
</template>
