import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5 * 60 * 1000, // 5 minutes for large file uploads
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register pages
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () => api.get('/auth/me'),
};

// Files API
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  isPublic: boolean;
  shareId: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface FileListParams {
  page?: number;
  limit?: number;
  search?: string;
  isPublic?: boolean;
  trash?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getMediaUrl(filename: string): string {
  if (!filename) return '';
  return `/uploads/${filename}`;
}

export async function triggerDownload(url: string, filename: string, token?: string): Promise<void> {
  const res = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  if (!res.ok) {
    throw new Error('Download failed');
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export const filesAPI = {
  upload: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<ApiResponse<FileUploadResponse>>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10 * 60 * 1000, // 10 minutes for large file uploads
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },

  list: (params: FileListParams = {}) => {
    const { page = 1, limit = 10, search, isPublic, trash } = params;
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) query.append('search', search);
    if (isPublic !== undefined) query.append('isPublic', String(isPublic));
    if (trash !== undefined) query.append('trash', String(trash));
    return api.get<PaginatedResponse<FileUploadResponse>>(`/files?${query}`);
  },

  listTrash: (params: FileListParams = {}) => {
    return filesAPI.list({ ...params, trash: true });
  },

  get: (id: string) =>
    api.get<{ success: boolean; data: FileUploadResponse }>(`/files/${id}`),

  delete: (id: string) =>
    api.delete(`/files/${id}`),

  restore: (id: string) =>
    api.patch(`/files/${id}/restore`),

  permanentDelete: (id: string) =>
    api.delete(`/files/${id}/permanent`),

  update: (id: string, data: { originalName?: string }) =>
    api.patch(`/files/${id}`, data),

  toggleShare: (id: string) =>
    api.patch(`/files/${id}/share`),

  getPublic: (shareId: string) =>
    api.get(`/files/public/${shareId}`),
};

export default api;