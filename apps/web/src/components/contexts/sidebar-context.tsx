'use client';

import { createContext, useState, useContext } from 'react';

interface SidebarContextProps {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  showSidebarOpen: boolean;
  setShowSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

type SidebarProviderProps = {
  children: React.ReactNode;
};

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSidebarOpen, setShowSidebarOpen] = useState(true);

  const openSidebar = () => {
    setShowSidebarOpen(false);
    setIsSidebarOpen(true);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        showSidebarOpen,
        setShowSidebarOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
