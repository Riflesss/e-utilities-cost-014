import { defineStore } from 'pinia';
import api from '../services/api';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    expenseCategories: [],
    budgetCategories: [],
    loading: false,
  }),

  actions: {
    async fetchExpenseCategories() {
      const { data } = await api.get('/expense-categories');
      this.expenseCategories = data;
    },

    async fetchBudgetCategories() {
      const { data } = await api.get('/budget-categories');
      this.budgetCategories = data;
    },

    async fetchAll() {
      this.loading = true;
      try {
        await Promise.all([this.fetchExpenseCategories(), this.fetchBudgetCategories()]);
      } finally {
        this.loading = false;
      }
    },

    // ----- Expense Category CRUD -----
    async createExpenseCategory(payload) {
      await api.post('/expense-categories', payload);
      await this.fetchExpenseCategories();
    },
    async updateExpenseCategory(id, payload) {
      await api.put(`/expense-categories/${id}`, payload);
      await this.fetchExpenseCategories();
    },
    async deleteExpenseCategory(id) {
      await api.delete(`/expense-categories/${id}`);
      await this.fetchExpenseCategories();
    },

    // ----- Budget Category CRUD -----
    async createBudgetCategory(payload) {
      await api.post('/budget-categories', payload);
      await this.fetchBudgetCategories();
    },
    async updateBudgetCategory(id, payload) {
      await api.put(`/budget-categories/${id}`, payload);
      await this.fetchBudgetCategories();
    },
    async deleteBudgetCategory(id) {
      await api.delete(`/budget-categories/${id}`);
      await this.fetchBudgetCategories();
    },
  },
});
