import { FeaturedStoryTemplates } from '@/components/featured-story-templates';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <FeaturedStoryTemplates featuredStoryTemplates={[1, 1, 1]} className="mt-20" />
    </div>
  );
}
