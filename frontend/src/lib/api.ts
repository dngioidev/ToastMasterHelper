import axios from 'axios';
import { useAuthStore } from '../features/auth/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Unwrap the global { data: T } envelope from TransformInterceptor
    if (response.data && Object.prototype.hasOwnProperty.call(response.data, 'data')) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
