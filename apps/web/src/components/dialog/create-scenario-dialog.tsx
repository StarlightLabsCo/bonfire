'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { useDialogStore } from '@/stores/dialog-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '../ui/textarea';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { StarlightWebSocketRequestType } from 'websocket';

export function CreateScenarioDialog() {
  // const isCreateScenarioDialogOpen = useDialogStore((state) => state.isCreateScenarioDialogOpen);
  // const setIsCreateScenarioDialogOpen = useDialogStore((state) => state.setIsCreateScenarioDialogOpen);

  const [activeTab, setActiveTab] = useState('narrator');

  const [persona, setPersona] = useState('');
  const [voice, setVoice] = useState('');
  const [outline, setOutline] = useState('');
  const [style, setStyle] = useState('');

  return (
    <Dialog open={false} onOpenChange={() => {}}>
      <DialogContent className="flex flex-col max-w-3xl h-3/4">
        <DialogHeader>
          <DialogTitle>Create Scenario</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full pt-5" orientation="vertical">
          <TabsList className="flex flex-col items-start justify-start h-full mr-6 gap-y-1 bg-neutral-950">
            <TabsTrigger value="narrator" className="flex p-0 text-md gap-x-2">
              <Icons.person />
              Narrator
            </TabsTrigger>
            <TabsTrigger value="outline" className="flex p-0 text-md gap-x-2">
              <Icons.book /> Story Outline
            </TabsTrigger>
            <TabsTrigger value="style" className="flex p-0 text-md gap-x-2">
              <Icons.image />
              Image Style
            </TabsTrigger>
          </TabsList>

          {activeTab === 'narrator' ? (
            <div className="flex flex-col w-full h-full gap-y-3">
              <div className="flex flex-col gap-y-1">
                <div>Persona</div>
                <Textarea
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="w-full h-20 border-white/10 bg-neutral-900"
                />
              </div>

              <div className="flex flex-col gap-y-1">
                <div>Voice</div>
                <Textarea value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full h-20 border-white/10 bg-neutral-900" />
              </div>
              <Button
                className="w-20 mt-auto ml-auto"
                onClick={() => {
                  setActiveTab('outline');
                }}
              >
                Next
              </Button>
            </div>
          ) : null}

          {activeTab === 'outline' ? (
            <div className="flex flex-col w-full h-full gap-y-3">
              <div className="flex flex-col gap-y-1">
                <div>Outline</div>
                <Textarea
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  className="w-full h-20 border-white/10 bg-neutral-900"
                />
              </div>
              <Button
                className="w-20 mt-auto ml-auto"
                onClick={() => {
                  setActiveTab('style');
                }}
              >
                Next
              </Button>
            </div>
          ) : null}

          {activeTab === 'style' ? (
            <div className="flex flex-col w-full h-full gap-y-3">
              <div className="flex flex-col gap-y-1">
                <div>Style</div>
                <Textarea value={style} onChange={(e) => setStyle(e.target.value)} className="w-full h-20 border-white/10 bg-neutral-900" />
              </div>
            </div>
          ) : null}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
