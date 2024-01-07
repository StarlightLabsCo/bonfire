import { FeaturedStoryTemplates } from '@/components/featured-story-templates';
import { Hero } from '@/components/hero';

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-y-5 overflow-auto">
      <Hero />
      <FeaturedStoryTemplates featuredStoryTemplates={[1, 1, 1]} />
    </div>
  );
}
