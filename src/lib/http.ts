// src/lib/http.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// تابع برای ارسال درخواست GET
export const get = async (endpoint: string) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// تابع اصلاح‌شده برای ارسال درخواست POST/PUT با بدنه JSON یا FormData
export const post = async (endpoint: string, body: any, method: 'POST' | 'PUT' = 'POST') => {
  const isFormData = body instanceof FormData;

  const headers: HeadersInit = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: headers,
    body: isFormData ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Failed to submit data');
  }
  return response.json();
};

// تابع برای ارسال درخواست با فایل (FormData) - این تابع همچنان برای سادگی می‌تواند باقی بماند
export const postWithFiles = async (endpoint: string, formData: FormData) => {
    return post(endpoint, formData, 'POST');
};

// تابع برای ارسال درخواست DELETE
export const del = async (endpoint: string) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'Failed to delete data');
  }
  return response.json();
};