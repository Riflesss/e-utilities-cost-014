import { defineStore } from 'pinia';
import api from '../services/api';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const { data } = await api.get('/users');
        this.users = data;
      } finally {
        this.loading = false;
      }
    },

    async updateUserRole(id, role) {
      await api.patch(`/users/${id}/role`, { role });
      await this.fetchUsers();
    },

    async deleteUser(id) {
      await api.delete(`/users/${id}`);
      await this.fetchUsers();
    },
  },
});
