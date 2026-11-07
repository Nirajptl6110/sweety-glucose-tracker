import axios from 'axios';

export const AUTH_STORAGE_KEY = 'sweety.auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const savedAuth = JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) || 'null');
    if (savedAuth?.token) {
      config.headers.Authorization = `Bearer ${savedAuth.token}`;
    }
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && sessionStorage.getItem(AUTH_STORAGE_KEY)) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new Event('sweety:logout'));
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const response = error.response?.data;
  const details = response?.error?.details;
  if (details && typeof details === 'object') {
    const firstDetail = Object.values(details)[0];
    if (firstDetail) return firstDetail;
  }
  return response?.message || fallback;
}

export default api;
