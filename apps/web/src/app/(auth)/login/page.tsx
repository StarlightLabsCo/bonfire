import { Metadata } from 'next';
import { Icons } from '@/components/icons';
import { UserAuthForm } from '@/components/auth/user-auth-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
};

export default function Login() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Limitless adventure is one step closer
          </p>
        </div>
        <UserAuthForm />
      </div>
    </div>
  );
}
