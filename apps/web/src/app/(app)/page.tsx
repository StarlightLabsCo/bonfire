import { FeaturedStoryTemplates } from '@/components/featured-story-templates';
import { Hero } from '@/components/hero';

export default function Home() {
  return (
    <div className="h-[100dvh] w-full flex flex-col items-center gap-y-5 overflow-y-scroll">
      <Hero />
      <FeaturedStoryTemplates featuredStoryTemplates={[1, 1, 1]} />
      <FeaturedStoryTemplates featuredStoryTemplates={[1, 1, 1]} />
      <FeaturedStoryTemplates featuredStoryTemplates={[1, 1, 1]} />
    </div>
  );
}
