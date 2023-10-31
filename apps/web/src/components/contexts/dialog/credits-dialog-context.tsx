'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useWebSocket } from '../ws-context';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

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
  const { addMessageHandler, removeMessageHandler } = useWebSocket();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function openDialog(response: StarlightWebSocketResponse) {
    if (response.type === StarlightWebSocketResponseType.outOfCredits) {
      setIsDialogOpen(true);
    }
  }

  useEffect(() => {
    addMessageHandler(openDialog);

    return () => {
      removeMessageHandler(openDialog);
    };
  }, []);

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
