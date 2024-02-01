import { Lobby } from '@/components/pages/lobby';
import { getImages } from '@/lib/caching';
import { getCurrentUser } from '@/lib/session';

export const revalidate = 1800; // 30 minutes

export default async function Home() {
  const user = await getCurrentUser();
  const images = await getImages();

  return <Lobby user={user} imageUrls={images} />;
}
