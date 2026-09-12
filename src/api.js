import axios from 'axios';

const API = axios.create({ baseURL: 'https://rkcoaching-backend-production.up.railway.app/api' });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 or 422 → clear stale token and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 422) {
      localStorage.removeItem('rk_token');
      localStorage.removeItem('rk_user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
