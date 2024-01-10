import { Hero } from '@/components/hero';
import { FeaturedStoryTemplates } from '@/components/featured-story-templates';
import { CommunityHub } from '@/components/community-hub';
import { MyTemplates } from '@/components/my-templates';
import db from '@/lib/db';

export default async function Home() {
  const featuredTemplates = await db.instanceTemplate
    .findMany({
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
      take: 5,
    })
    .then((templates) =>
      templates.map((template) => ({
        ...template,
        user: {
          ...template.user,
          name: template.user.name || 'Anonymous',
          image: template.user.image || '/profile.png',
        },
      })),
    );

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center gap-y-10 overflow-y-scroll pb-60">
      <Hero />
      <FeaturedStoryTemplates featuredStoryTemplates={featuredTemplates} />
      <CommunityHub />
      <MyTemplates />
    </div>
  );
}
