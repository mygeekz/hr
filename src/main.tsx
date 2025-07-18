// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from '@/lib/auth'; // AuthProvider را وارد کنید
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* کل برنامه را با این کامپوننت پوشش دهید */}
      <App />
      <Toaster richColors />
    </AuthProvider>
  </React.StrictMode>
);