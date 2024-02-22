import { cn } from '@/lib/utils';
import { ActionSuggestion } from 'websocket';

type ActionSuggestionsProps = {
  suggestions: ActionSuggestion[];
  submitAction: (action: string) => void;
  disabled?: boolean;
  className?: string;
};

export function ActionSuggestions({ suggestions, submitAction, disabled, className }: ActionSuggestionsProps) {
  return (
    <>
      <div className="absolute z-10 w-6 h-8 left-4 md:hidden bg-gradient-to-r from-neutral-950 to-transparent" />
      {suggestions.map((suggestion: ActionSuggestion, index: number) => (
        <button
          key={index}
          className={cn(
            'px-3 py-1 rounded-full border-[0.5px] border-white/20 bg-neutral-950 text-white/70 whitespace-nowrap fade-in-2s',
            { 'hover:border-white/30 hover:text-white/90': !disabled },
            className,
          )}
          onClick={() => !disabled && submitAction(suggestion.action)}
          disabled={disabled}
        >
          <span className="text-xs font-light md:text-sm">{suggestion.action}</span>
        </button>
      ))}
      <div className="absolute z-10 w-6 h-8 right-4 md:hidden bg-gradient-to-l from-neutral-950 to-transparent" />
    </>
  );
}
