import { ExampleStory, StoryStep } from '@/components/pages/example-story';
import examples from './examples.json';

type Examples = {
  [key: string]: StoryStep;
};

export default function Example({ params }: { params: { id: string } }) {
  const story = (examples as Examples)[params.id];

  return <ExampleStory story={story} />;
}
