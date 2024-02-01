import { Lobby } from '@/components/pages/lobby';
import { getImages } from '@/lib/caching';

export const revalidate = 1800; // 30 minutes

export default async function Home() {
  const images = await getImages();

  return <Lobby imageUrls={images} />;
}
