import { cn } from '@/lib/utils';

interface SuggestionsProps {
  suggestions: string[] | null | undefined;
  onSelect: (suggestion: string) => void;
  className?: string;
}

export function Suggestions({
  suggestions,
  onSelect,
  className,
}: SuggestionsProps) {
  return (
    <div className={cn('flex flex-row flex-wrap gap-x-2 gap-y-2', className)}>
      {suggestions &&
        suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="px-3 py-1 border rounded-full border-neutral-900 hover:border-neutral-800 text-neutral-600 hover:text-neutral-500 fade-in-2s"
            onClick={() => onSelect(suggestion)}
          >
            <span className="text-xs md:text-sm font-light">{suggestion}</span>
          </button>
        ))}
    </div>
  );
}
