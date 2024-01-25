'use client';

import { useUiStore } from '@/stores/ui-store';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();
  const requestedToast = useUiStore((state) => state.toast);

  useEffect(() => {
    if (requestedToast) {
      toast(requestedToast);
      useUiStore.setState({ toast: null });
    }
  }, [requestedToast]);

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-neutral-950 group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
