import db from '@/lib/db';
import { cn } from '@/lib/utils';
import { TemplatePreviewCard } from './template-preview-card';

type CommunityHubProps = {
  className?: string;
};

export async function CommunityHub({ className }: CommunityHubProps) {
  const templates = await db.instanceTemplate.findMany({
    orderBy: {
      plays: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    take: 12,
  });

  return (
    <div className={cn('w-3/4 flex flex-col gap-y-4', className)}>
      <div className="w-full flex justify-between items-center">
        <h2 className="text-2xl font-medium">Community Hub</h2>
        <input
          placeholder="Search Story Templates"
          className="w-3/5 flex items-center px-4 py-2 border-[0.5px] border-white/20 rounded-2xl text-sm placeholder:text-neutral-500 bg-neutral-900 focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplatePreviewCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
