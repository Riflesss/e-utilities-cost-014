import api from './api';

export default {
  register({ username, password, full_name, confirmPassword }) {
    return api.post('/auth/register', { username, password, full_name, confirmPassword });
  },
  login(username, password) {
    return api.post('/auth/login', { username, password });
  },
  logout() {
    return api.post('/auth/logout');
  },
  refresh() {
    return api.post('/auth/refresh');
  },
  me() {
    return api.get('/auth/me');
  },
};
