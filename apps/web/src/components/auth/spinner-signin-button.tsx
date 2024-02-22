'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';

type SpinnerSignInButtonProps = {
  provider: 'google' | 'apple' | 'discord';
  className?: string;
};

export function SpinnerSignInButton({ provider, className }: SpinnerSignInButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = () => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: '/' });
  };

  const icons = {
    apple: <Icons.apple className="w-4 h-4 mr-2" />,
    google: <Icons.google className="w-4 h-4 mr-2" />,
    discord: <Icons.discord className="w-4 h-4 mr-2" />,
  };

  const texts = {
    apple: 'Apple',
    google: 'Google',
    discord: 'Discord',
  };

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      onClick={handleClick}
      className={cn('border-white/10 hover:bg-neutral-800', className)}
    >
      {isLoading ? <Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> : icons[provider]} {texts[provider]}
    </Button>
  );
}
