'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useWebSocket } from './ws-context';

interface OutOfCreditsDialogContextProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OutOfCreditsDialogContext = createContext<OutOfCreditsDialogContextProps | undefined>(undefined);

type OutOfCreditsDialogProviderProps = {
  children: React.ReactNode;
};

export const OutOfCreditsDialogProvider: React.FC<OutOfCreditsDialogProviderProps> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { socket } = useWebSocket();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);

    if (data.type === WebSocketResponseType.outOfCredits) {
      setIsDialogOpen(true);
    }
  }

  useEffect(() => {
    if (socket) {
      socket.addEventListener('message', handleMessage);
    }

    return () => {
      socket?.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  return (
    <OutOfCreditsDialogContext.Provider
      value={{
        isDialogOpen,
        setIsDialogOpen,
      }}
    >
      {children}
    </OutOfCreditsDialogContext.Provider>
  );
};

export const useOutOfCreditsDialog = () => {
  const context = useContext(OutOfCreditsDialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
