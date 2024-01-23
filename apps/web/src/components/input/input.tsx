import { cn } from '@/lib/utils';
import { Icons } from '../icons';
import { FC, InputHTMLAttributes } from 'react';
import { useWebsocketStore } from '@/stores/websocket-store';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  setValue: (value: string) => void;
  submit: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const Input: FC<InputProps> = ({ value, setValue, submit, placeholder, className, disabled, ...props }) => {
  const socketState = useWebsocketStore((state) => state.socketState);

  function submitValue() {
    submit();
  }

  if (socketState !== 'open') {
    const placeholder = socketState === 'disconnected' ? 'Disconnected' : 'Connecting...';

    return (
      <div
        className={cn(
          'w-full flex items-center px-4 py-2 border-[0.5px] border-white/20 bg-neutral-900 rounded-2xl disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <input
          placeholder={placeholder}
          className="w-full py-2 text-sm placeholder:text-neutral-500 bg-neutral-900 focus:outline-none"
          value={undefined}
          disabled={true}
        />
        <Icons.microphoneSlash className="w-4 h-4 text-neutral-400 mr-2" />
        <Icons.lockClosed className="w-4 h-4 text-neutral-400" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full flex items-center px-4 py-2 border-[0.5px] border-white/20 bg-neutral-900 rounded-2xl disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <input
        placeholder={placeholder}
        className="w-full py-2 text-sm placeholder:text-neutral-500 bg-neutral-900 focus:outline-none"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            submit();
          }
        }}
        disabled={disabled}
        {...props}
      />
      {disabled ? (
        <Icons.lockClosed className="w-4 h-4 text-neutral-400" />
      ) : (
        <Icons.paperPlane
          className={cn('w-4 h-4 cursor-pointer text-neutral-500')}
          onClick={() => {
            if (disabled) return;
            submitValue();
          }}
        />
      )}
    </div>
  );
};

export { Input };
