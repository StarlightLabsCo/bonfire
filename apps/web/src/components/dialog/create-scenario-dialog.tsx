'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDialogStore } from '@/stores/dialog-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CreateScenarioDialog() {
  const isCreateScenarioDialogOpen = useDialogStore((state) => state.isCreateScenarioDialogOpen);
  const setIsCreateScenarioDialogOpen = useDialogStore((state) => state.setIsCreateScenarioDialogOpen);

  return (
    <Dialog open={isCreateScenarioDialogOpen} onOpenChange={setIsCreateScenarioDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Scenario</DialogTitle>
          <DialogDescription>
            <Tabs defaultValue="account" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent value="account">Make changes to your account here.</TabsContent>
              <TabsContent value="password">Change your password here.</TabsContent>
            </Tabs>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
