import { cn } from '@/lib/utils';
import { Icons } from '../icons';
import { FC, InputHTMLAttributes, useEffect, useState } from 'react';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useTranscriptionStore } from '@/stores/audio/transcription-store';

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

  const audioRecorder = useTranscriptionStore((state) => state.audioRecorder);
  const transcription = useTranscriptionStore((state) => state.transcription);
  const setTranscription = useTranscriptionStore((state) => state.setTranscription);

  const [recording, setRecording] = useState<boolean>(false);

  useEffect(() => {
    if (transcription) {
      setValue(transcription);
    }
  }, [setValue, transcription]);

  useEffect(() => {
    if (disabled && recording && audioRecorder) {
      setRecording(false);
      audioRecorder.stopRecording();
    }
  }, [disabled, recording, audioRecorder]);

  function submitValue() {
    submit();
    setTranscription('');
  }

  if (socketState === 'disconnected') {
    return <div className="w-full flex items-center justify-center">Disconnected</div>;
  } else if (socketState !== 'open') {
    return <div className="w-full flex items-center justify-center">Connecting...</div>;
  }

  return (
    <div
      className={cn(
        'w-full flex items-center px-4 py-2 bg-neutral-900 rounded-2xl disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <input
        placeholder={disabled ? 'Generating...' : placeholder}
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
        <Icons.microphoneSlash className="w-4 h-4 text-neutral-400 mr-2" />
      ) : (
        <Icons.microphone
          className={cn('w-4 h-4 cursor-pointer text-neutral-500 mr-2', recording && 'animate-pulse text-red-500')}
          onClick={() => {
            if (disabled) return;

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
      )}
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
