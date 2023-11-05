'use client';

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { useUiStore } from '@/stores/ui-store';
import { useEffect } from 'react';

export function Toaster() {
  const { toasts, toast } = useToast();
  const requestedToast = useUiStore((state) => state.toast);

  useEffect(() => {
    if (requestedToast) {
      toast(requestedToast);
      useUiStore.setState({ toast: null });
    }
  }, [requestedToast, toast]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
