import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CreateTemplateButton } from './create-template-button';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { TemplatePreviewCard } from './template-preview-card';

type MyTemplatesProps = {
  className?: string;
};

export async function MyTemplates({ className }: MyTemplatesProps) {
  const user = await getCurrentUser();

  if (!user) return null;

  const templates = await db.instanceTemplate.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: 'desc',
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
        <h2 className="text-2xl font-medium">My Templates</h2>
        <input
          placeholder="Search Story Templates"
          className="w-3/5 flex items-center px-4 py-2 border-[0.5px] border-white/20 rounded-2xl text-sm placeholder:text-neutral-500 bg-neutral-900 focus:outline-none"
        />
      </div>
      {templates.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <TemplatePreviewCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="w-full h-60 flex flex-col justify-center items-center gap-y-2">
          <div>You haven&apos;t made any templates yet</div>
          <CreateTemplateButton />
        </div>
      )}
    </div>
  );
}
