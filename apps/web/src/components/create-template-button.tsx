'use client';

import { useDialogStore } from '@/stores/dialog-store';

type CreateTemplateButtonProps = {
  className?: string;
};

export function CreateTemplateButton({ className }: CreateTemplateButtonProps) {
  const setIsCreateScenarioDialogOpen = useDialogStore((state) => state.setIsCreateScenarioDialogOpen);

  const openDialog = () => {
    setIsCreateScenarioDialogOpen(true);
  };

  return (
    <button className="px-3 py-1 border rounded-full bg-orange-500 hover:scale-105" onClick={openDialog}>
      <span className="text-xs md:text-sm font-bold">Create</span>
    </button>
  );
}
