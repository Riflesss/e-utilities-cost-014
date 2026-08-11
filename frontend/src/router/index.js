import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/expenses', name: 'expenses', component: () => import('../views/ExpenseListView.vue') },
  { path: '/expenses/create', name: 'expense-create', component: () => import('../views/ExpenseFormView.vue') },
  { path: '/expenses/:id/edit', name: 'expense-edit', component: () => import('../views/ExpenseFormView.vue'), props: true },
  { path: '/settings/categories', name: 'category-manage', component: () => import('../views/CategoryManageView.vue'), meta: { admin: true } },
  { path: '/settings/expense-categories', name: 'expense-category-manage', component: () => import('../views/CategoryManageView.vue'), meta: { admin: true } },
  { path: '/settings/budget-categories', name: 'budget-category-manage', component: () => import('../views/CategoryManageView.vue'), meta: { admin: true } },
  { path: '/settings/users', name: 'user-manage', component: () => import('../views/UserManageView.vue'), meta: { admin: true } },
  { path: '/reports', name: 'reports', component: () => import('../views/ReportHistoryView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Route guard: redirect ไปหน้า login ถ้ายังไม่ได้ login
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (to.meta.public) return true;

  if (!authStore.isLoggedIn) {
    const restored = await authStore.tryRestoreSession();
    if (!restored) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }
  }

  if (to.meta.admin && authStore.user?.role !== 'admin') {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
