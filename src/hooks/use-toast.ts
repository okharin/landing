import { useState } from 'react';

interface Toast {
  id: string;
  message: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (toast: Toast) => setToasts((prev) => [...prev, toast]);
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, addToast, removeToast };
}

export const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
  info: (message: string) => console.info('Info:', message),
}; 