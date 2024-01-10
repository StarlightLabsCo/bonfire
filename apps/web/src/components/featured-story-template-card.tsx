import Image from 'next/image';
import { PlayTemplateButton } from './play-template-button';
import { InstanceTemplate, User } from 'database';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

type FeaturedStoryTemplateCardProps = {
  template: InstanceTemplate & {
    user: {
      name: string;
      image: string;
    };
  };
  isActive: boolean;
};

export function FeaturedStoryTemplateCard({ template, isActive }: FeaturedStoryTemplateCardProps) {
  const timeAgo = new TimeAgo('en-US');

  return (
    <div className="w-full h-80 flex">
      <div className="relative w-1/2 h-full">
        <Image
          src={template.imageURL || 'https://r2.trybonfire.ai/hero.png'}
          alt={template.name + "'s cover image"}
          layout="fill"
          objectFit="cover"
          className="rounded-2xl"
        />
      </div>
      <div className={`relative w-1/2 h-full pl-6 flex flex-col gap-y-2`}>
        <h2 className={`text-2xl font-medium ${isActive ? 'animate-fade-in-bottom-0' : ''}`}>{template.name}</h2>
        <div className={`flex gap-x-2 ${isActive ? 'animate-fade-in-bottom-1' : ''}`}>
          <div className={`border border-white/10 rounded-full px-4 py-1 text-xs font-light`}>Comfy</div>
          <div className={`border border-white/10 rounded-full px-4 py-1 text-xs font-light`}>Fantasy</div>
        </div>
        <div className={`text-xs font-light mt-2 ${isActive ? 'animate-fade-in-bottom-2' : ''}`}>{template.description}</div>
        <div className={`mt-auto w-full flex justify-between items-center ${isActive ? 'animate-fade-in-bottom-3' : ''}`}>
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
          <div className="flex flex-col items-center gap-y-1">
            <PlayTemplateButton templateId={template.id} />
            <div className="text-xs font-light text-neutral-500">{template.plays} plays</div>
          </div>
        </div>
      </div>
    </div>
  );
}
