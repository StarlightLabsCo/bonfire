import { Icons } from '@/components/icons';
import { SpinnerSignInButton } from '@/components/auth/spinner-signin-button';

export default function Login() {
  return (
    <div className="container  flex h-screen w-screen flex-col items-center justify-center bg-black">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-1 text-center">
          <Icons.fire className="mx-auto h-6 w-6 text-[#ff8f00]" />
          <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
          <p className="text-sm text-white/50">Limitless adventure is one step closer</p>
        </div>
        <div className="grid gap-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-neutral-200">Continue with</span>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <SpinnerSignInButton provider="apple" />
            <SpinnerSignInButton provider="google" />
          </div>
        </div>
      </div>
    </div>
  );
}
