import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// API helpers
export const auth = {
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};
export const streams = {
  list: () => api.get('/streams'),
  get: (id: string) => api.get(`/streams/${id}`),
  create: (data: any) => api.post('/streams', data),
  update: (id: string, data: any) => api.put(`/streams/${id}`, data),
  delete: (id: string) => api.delete(`/streams/${id}`),
  assignSubjects: (id: string, subjectIds: string[]) => api.post(`/streams/${id}/subjects`, { subjectIds }),
};
export const students = {
  list: (params?: any) => api.get('/students', { params }),
  get: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};
export const subjects = {
  list: () => api.get('/subjects'),
  create: (data: any) => api.post('/subjects', data),
  update: (id: string, data: any) => api.put(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};
export const assessments = {
  dashboard: () => api.get('/assessments/dashboard'),
  student: (id: string, params?: any) => api.get(`/assessments/student/${id}`, { params }),
  class: (streamId: string, params?: any) => api.get(`/assessments/class/${streamId}`, { params }),
  create: (data: any) => api.post('/assessments', data),
  update: (id: string, data: any) => api.put(`/assessments/${id}`, data),
};
export const grading = {
  list: () => api.get('/grading'),
  update: (scales: any[]) => api.post('/grading', { scales }),
};
