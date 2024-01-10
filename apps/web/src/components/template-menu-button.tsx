import { Icons } from '@/components/icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { InstanceTemplate } from 'database';

type TemplateMenuButtonProps = {
  template: InstanceTemplate;
  className?: string;
};

export function TemplateMenuButton({ template, className }: TemplateMenuButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Icons.moreHorizontal className={cn('w-4 h-4 text-white/50 hover:text-white', className)} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuItem className="text-xs font-light cursor-pointer focus:bg-neutral-800 p-2">
          <Icons.share className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs font-light cursor-pointer focus:bg-neutral-800 p-2">
          <Icons.pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs font-light cursor-pointer focus:bg-neutral-800 text-red-500 p-2">
          <Icons.trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
