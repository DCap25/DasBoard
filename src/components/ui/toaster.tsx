'use client';

import { ToastContextProvider } from '@/lib/use-toast';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/toast';

export function Toaster() {
  return <ToastContextProvider />;
}
