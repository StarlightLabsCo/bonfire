import { ExampleStory } from '@/components/pages/example-story';

export default function Example({ params }: { params: { id: string } }) {
  // fetch example story by id from r2 bucket
  // represent it as a big JSON object?

  return <ExampleStory story={{}} />;
}
