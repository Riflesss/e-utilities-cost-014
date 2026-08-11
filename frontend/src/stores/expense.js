import { defineStore } from 'pinia';
import api from '../services/api';

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    expenses: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
    dashboardSummary: null,
    byCategory: [],
    byBudget: [],
    loading: false,
  }),

  actions: {
    // filters: { month, year, expense_category_id, budget_category_id, page, limit }
    async fetchExpenses(filters = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/expenses', { params: filters });
        this.expenses = data.data;
        this.pagination = data.pagination;
      } finally {
        this.loading = false;
      }
    },

    async createExpense(payload) {
      const hasAttachment = payload && payload.attachmentFile instanceof File;
      if (!hasAttachment) {
        await api.post('/expenses', payload);
        return;
      }

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'attachmentFile') return;
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });
      formData.append('attachment', payload.attachmentFile);

      await api.post('/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    async updateExpense(id, payload) {
      const hasAttachment = payload && payload.attachmentFile instanceof File;
      if (!hasAttachment) {
        await api.put(`/expenses/${id}`, payload);
        return;
      }

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'attachmentFile') return;
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });
      formData.append('attachment', payload.attachmentFile);

      await api.put(`/expenses/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    async deleteExpense(id) {
      await api.delete(`/expenses/${id}`);
    },

    async getExpense(id) {
      const { data } = await api.get(`/expenses/${id}`);
      return data;
    },

    // ----- Dashboard -----
    async fetchDashboardSummary(year) {
      const { data } = await api.get('/dashboard/summary', { params: { year } });
      this.dashboardSummary = data;
    },

    async fetchByCategory(year) {
      const { data } = await api.get('/dashboard/by-category', { params: { year } });
      this.byCategory = data;
    },

    async fetchByBudget(year) {
      const { data } = await api.get('/dashboard/by-budget', { params: { year } });
      this.byBudget = data;
    },

    async fetchCompare(year1, year2) {
      const { data } = await api.get('/dashboard/compare', { params: { year1, year2 } });
      return data;
    },
  },
});
