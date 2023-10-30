import { cn } from '@/lib/utils';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { Icons } from '../icons';
import { FC, InputHTMLAttributes, useEffect, useState } from 'react';
import { useAudioProcessor } from '../contexts/audio-context';
import { useWebSocket } from '../contexts/ws-context';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  setValue: (value: string) => void;
  submit: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const Input: FC<InputProps> = ({
  value,
  setValue,
  submit,
  placeholder,
  className,
  ...props
}) => {
  const { socketState } = useWebSocket();

  const { audioRecorder, transcription, setTranscription } =
    useAudioProcessor();

  const [recording, setRecording] = useState<boolean>(false);

  useEffect(() => {
    if (transcription) {
      setValue(transcription);
    }
  }, [setValue, transcription]);

  function submitValue() {
    submit();
    setTranscription('');
  }

  if (socketState !== 'open') {
    return (
      <div className="w-full flex items-center justify-center">
        Connecting...
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full flex items-center px-4 py-2 bg-neutral-900 rounded-2xl disabled:cursor-not-allowed disabled:opacity-50',
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
        {...props}
      />
      <Icons.microphone
        className={cn(
          'w-4 h-4 cursor-pointer text-neutral-500 mr-2',
          recording && 'animate-pulse text-red-500',
        )}
        onClick={() => {
          if (!audioRecorder) {
            console.error('Audio recorder not initialized');
            return;
          }

          if (!recording) {
            setTranscription('');
            setValue('');

            setRecording(true);
            audioRecorder.startRecording();
          } else {
            setRecording(false);
            audioRecorder.stopRecording();
          }
        }}
      />
      <PaperPlaneIcon
        className={cn('w-4 h-4 cursor-pointer text-neutral-500')}
        onClick={() => {
          submitValue();
        }}
      />
    </div>
  );
};

export { Input };
