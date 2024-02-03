'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';

type SpinnerSignInButtonProps = {
  provider: 'google' | 'apple';
  className?: string;
};

export function SpinnerSignInButton({ provider, className }: SpinnerSignInButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = () => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: '/' });
  };

  const icons = {
    apple: <Icons.apple className="mr-2 h-4 w-4" />,
    google: <Icons.google className="mr-2 h-4 w-4" />,
  };

  const texts = {
    apple: 'Apple',
    google: 'Google',
  };

  return (
    <Button variant="outline" type="button" disabled={isLoading} onClick={handleClick} className={cn('border-white/10', className)}>
      {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : icons[provider]} {texts[provider]}
    </Button>
  );
}
