import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type StoryTitleInputProps = {
  storyTitle: string;
  setStoryTitle: (value: string) => void;
  className?: string;
};

export default function StoryTitleInput({ storyTitle, setStoryTitle, className }: StoryTitleInputProps) {
  const gptCompleteStoryTitle = () => {};

  return (
    <div className={cn('w-full flex flex-col gap-y-2 px-4 border-b border-white/10 pb-10', className)}>
      <div className="flex justify-between items-center mt-5">
        <div className="font-bold">Story Title</div>
        <div
          className="px-3 py-1 flex gap-x-1 items-center justify-center border border-white/10 rounded-lg text-xs font-light cursor-pointer hover:bg-white/5"
          onClick={gptCompleteStoryTitle}
        >
          Complete
          <Icons.sparkles className="h-3 w-3" />
        </div>
      </div>
      <input
        placeholder="Type your story title here..."
        value={storyTitle}
        onChange={(e) => setStoryTitle(e.target.value)}
        className="w-full border border-white/10 rounded-lg p-2 bg-black text-xs"
      />
    </div>
  );
}
