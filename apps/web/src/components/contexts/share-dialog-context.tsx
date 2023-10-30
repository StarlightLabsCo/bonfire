'use client';

import { createContext, useState, useContext, useEffect } from 'react';

interface ShareDialogContextProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ShareDialogContext = createContext<
  ShareDialogContextProps | undefined
>(undefined);

type ShareDialogProviderProps = {
  children: React.ReactNode;
};

export const ShareDialogProvider: React.FC<ShareDialogProviderProps> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <ShareDialogContext.Provider
      value={{
        isDialogOpen,
        setIsDialogOpen,
      }}
    >
      {children}
    </ShareDialogContext.Provider>
  );
};

export const useShareDialog = () => {
  const context = useContext(ShareDialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
