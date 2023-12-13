'use client';

import { Icons } from '../../icons';
import { useDialogStore } from '@/stores/dialog-store';
import { Button } from './button';

interface ShareButtonProps {
  className?: string;
}

export function ShareButton({ className }: ShareButtonProps) {
  const setIsShareDialogOpen = useDialogStore((state) => state.setIsShareDialogOpen);

  return <Button className={className} onClick={() => setIsShareDialogOpen(true)} icon={<Icons.share />} />;
}
