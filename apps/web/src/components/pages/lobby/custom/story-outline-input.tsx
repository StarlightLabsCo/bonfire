import { Icons } from '@/components/icons';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type StoryOutlineInputProps = {
  storyOutline: string;
  setStoryOutline: (value: string) => void;
  className?: string;
};

export default function StoryOutlineInput({ storyOutline, setStoryOutline, className }: StoryOutlineInputProps) {
  const gptCompleteStoryOutline = () => {
    // Call GPT-3 to complete the story outline
  };

  return (
    <div className={cn('w-full flex flex-col gap-y-2 px-4 border-b border-white/10 pb-10', className)}>
      <div className="flex justify-between items-center mt-5">
        <div className="font-bold">Story Outline</div>
        <div
          className="px-3 py-1 flex gap-x-1 items-center justify-center border border-white/10 rounded-lg text-xs font-light cursor-pointer hover:bg-white/5"
          onClick={gptCompleteStoryOutline}
        >
          Complete
          <Icons.sparkles className="h-3 w-3" />
        </div>
      </div>
      <Textarea
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        placeholder="Type your story outline here..."
        value={storyOutline}
        onChange={(e) => setStoryOutline(e.target.value)}
        className="w-full h-40 border-white/10 bg-black text-xs"
      />
    </div>
  );
}
