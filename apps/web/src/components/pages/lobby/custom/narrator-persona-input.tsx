import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type NarratorPersonaInputProps = {
  narratorPrompt: string;
  setNarratorPrompt: (value: string) => void;
  className?: string;
};

export default function NarratorPersonaInput({ narratorPrompt, setNarratorPrompt, className }: NarratorPersonaInputProps) {
  return (
    <div className={cn('w-full flex flex-col gap-y-2 px-4 border-b border-white/10 pb-10', className)}>
      <div className="flex items-center font-bold">Narrator Persona</div>
      <div className="w-full flex flex-col gap-y-2">
        <div className={cn('flex flex-col border border-white/10 rounded-lg px-4 py-2', { 'border-white': narratorPrompt.length == 0 })}>
          <div className="font-bold">Classic</div>
          <div className="text-xs font-light text-neutral-400">
            A narrator that aims to create a choose your own adventure game with exciting twists and turns
          </div>
        </div>
        <div className="w-full flex gap-x-2 items-center justify-center">
          <div className="h-[1px] w-10 rounded-full bg-white" />
          <div>OR</div>
          <div className="h-[1px] w-10 rounded-full bg-white" />
        </div>
        <div className={cn('flex flex-col border border-white/10 rounded-lg px-4 py-2', { 'border-white': narratorPrompt.length > 0 })}>
          <div className="font-bold">Custom</div>
          <Textarea
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            value={narratorPrompt}
            onChange={(e) => setNarratorPrompt(e.target.value)}
            placeholder="Type your custom narrator style here..."
            className="w-full border-0 p-0 text-xs focus-visible:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
