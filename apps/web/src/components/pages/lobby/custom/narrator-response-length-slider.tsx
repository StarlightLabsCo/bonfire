import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type NarratorResponseLengthSliderProps = {
  narratorResponseLength: number;
  setNarratorResponseLength: (value: number) => void;
  className?: string;
};

export default function NarratorResponseLengthSlider({
  narratorResponseLength,
  setNarratorResponseLength,
  className,
}: NarratorResponseLengthSliderProps) {
  const onValueChange = (value: number[]) => {
    const sentencesLength = [2, 5, 8][value[0]];
    setNarratorResponseLength(sentencesLength);
  };

  const value = [2, 5, 8].indexOf(narratorResponseLength);

  return (
    <div className={cn('w-full flex flex-col gap-y-6 px-4 mb-10', className)}>
      <div className="flex items-center font-bold">Narrator Response Length</div>
      <div className="w-full flex flex-col gap-y-2">
        <Slider value={[value]} onValueChange={onValueChange} max={2} step={1} />
        <div className="flex justify-between">
          <div className="font-light text-sm text-neutral-400">Short</div>
          <div className="font-light text-sm text-neutral-400">Medium</div>
          <div className="font-light text-sm text-neutral-400">Long</div>
        </div>
      </div>
    </div>
  );
}
