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
      <div className="flex items-center justify-between mt-5">
        <div className="font-bold">Story Title</div>
        <div
          className="flex items-center justify-center px-3 py-1 text-xs font-light border rounded-lg cursor-pointer gap-x-1 border-white/10 hover:bg-white/5"
          onClick={gptCompleteStoryTitle}
        >
          Complete
          <Icons.sparkles className="w-3 h-3" />
        </div>
      </div>
      <input
        placeholder="Type your story title here..."
        value={storyTitle}
        onChange={(e) => setStoryTitle(e.target.value)}
        className="w-full p-2 text-xs bg-black border rounded-lg border-white/10"
      />
    </div>
  );
}
