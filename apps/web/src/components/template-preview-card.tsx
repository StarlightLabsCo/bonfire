import Link from 'next/link';
import { PlayTemplateButton } from './play-template-button';
import { InstanceTemplate, User } from 'database';
import { cn } from '@/lib/utils';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

type TemplatePreviewCardProps = {
  template: InstanceTemplate & {
    user: {
      name: string | null;
      image: string | null;
    };
  };
  className?: string;
};

export function TemplatePreviewCard({ template, className }: TemplatePreviewCardProps) {
  const timeAgo = new TimeAgo('en-US');

  return (
    <div className={cn('group relative transition-transform duration-200 hover:scale-105', className)}>
      <Link href={`/templates/${template.id}`}>
        <img src={template.imageURL} alt={template.name} className="rounded-lg group-hover:rounded-t-lg group-hover:rounded-b-none" />
      </Link>

      <div className="absolute bottom-0 transform translate-y-full bg-black z-50 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col rounded-bl-lg rounded-br-lg pointer-events-none group-hover:pointer-events-auto">
        <div className="text-white text-lg font-bold">{template.name}</div>
        <div className="text-gray-300 text-sm">{template.description}</div>
        <div className="w-full flex justify-between mt-6 items-center">
          <div className={`flex gap-x-2`}>
            <img
              className="w-10 h-10 rounded-full"
              src={template.user.image}
              alt={template.user.name + "'s profile picture"}
              width={400}
              height={400}
            />
            <div className={`flex flex-col gap-y-1`}>
              <div className="text-sm font-medium">{template.user.name}</div>
              <div className="text-xs font-light">{timeAgo.format(template.createdAt)}</div>
            </div>
          </div>
          <PlayTemplateButton templateId={template.id} />
        </div>
      </div>
    </div>
  );
}
