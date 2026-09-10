// Axios API client preconfigured with backend base URL and auth token.
import axios from 'axios';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL
  // ||  'https://web-constructor-50.preview.emergentagent.com';
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
});

// Interceptor adds token from localStorage to every request when available.
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
