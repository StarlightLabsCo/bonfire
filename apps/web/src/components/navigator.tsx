'use client';

import { useUiStore } from '@/stores/ui-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function Navigator() {
  const router = useRouter();
  const navigationPath = useUiStore((state) => state.navigationPath);

  useEffect(() => {
    if (navigationPath) {
      router.push(navigationPath);
      useUiStore.setState({ navigationPath: null });
    }
  }, [navigationPath]);

  return null;
}
