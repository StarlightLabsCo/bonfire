import db from '@/lib/db';
import { redirect } from 'next/navigation';

import { PlayTemplateButton } from '@/components/play-template-button';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { TemplateMenuButton } from '@/components/template-menu-button';
TimeAgo.addDefaultLocale(en);

export default async function Template({ params }: { params: { id: string } }) {
  const template = await db.instanceTemplate.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: true,
    },
  });

  if (!template) {
    redirect('/');
  }

  const timeAgo = new TimeAgo('en-US');

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center">
      <div className="w-1/2 flex flex-col gap-y-10">
        <img src={template.imageURL} alt="" className="rounded-lg mt-10 w-full" />
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col justify-center">
            <div className="text-2xl font-medium">{template.name}</div>
          </div>
          <TemplateMenuButton template={template} />
        </div>
        <div className="w-full text-sm text-neutral-500">{template.description}</div>
        <div className="w-full flex justify-between">
          <div className="flex items-center gap-x-2">
            <img src={template.user.image} alt="" className="rounded-full w-10 h-10" />
            <div className="flex flex-col">
              <div className="text-sm font-medium">{template.user.name}</div>
              <div className="text-xs text-neutral-500">{timeAgo.format(template.createdAt)}</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-1">
            <PlayTemplateButton templateId={template.id} />
            <div className="text-xs font-light text-neutral-500">{template.plays} plays</div>
          </div>
        </div>
      </div>
    </div>
  );
}
