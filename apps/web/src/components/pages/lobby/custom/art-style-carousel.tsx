import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ArtStyleCard } from './art-style-card';
import { cn } from '@/lib/utils';

const styles = [
  {
    title: 'Oil Painting',
    image: 'https://r2.trybonfire.ai/oil.webp',
  },
  {
    title: 'Digital Painting',
    image: 'https://r2.trybonfire.ai/digital.webp',
  },
  {
    title: 'Illustration',
    image: 'https://r2.trybonfire.ai/illustration.png',
  },
  {
    title: 'Realistic',
    image: 'https://r2.trybonfire.ai/realistic.png',
  },
  {
    title: 'Cartoon',
    image: 'https://r2.trybonfire.ai/cartoon.webp',
  },
  {
    title: '3D Render',
    image: 'https://r2.trybonfire.ai/3drender.webp',
  },
  {
    title: 'Watercolor',
    image: 'https://r2.trybonfire.ai/watercolor.webp',
  },
  {
    title: 'Neon',
    image: 'https://r2.trybonfire.ai/neon.webp',
  },
  {
    title: 'Vaporwave',
    image: 'https://r2.trybonfire.ai/vaporwave.webp',
  },
  {
    title: 'Comic Book',
    image: 'https://r2.trybonfire.ai/comic.webp',
  },
  {
    title: 'Minecraft',
    image: 'https://r2.trybonfire.ai/minecraft.webp',
  },
  {
    title: 'Anime',
    image: 'https://r2.trybonfire.ai/anime.webp',
  },
  {
    title: 'Manga',
    image: 'https://r2.trybonfire.ai/manga.webp',
  },
  {
    title: 'Chibi',
    image: 'https://r2.trybonfire.ai/chibi.webp',
  },
  {
    title: 'Greek Painting',
    image: 'https://r2.trybonfire.ai/greek.webp',
  },
  {
    title: 'Chinese Painting',
    image: 'https://r2.trybonfire.ai/chinese.webp',
  },
  {
    title: 'Aztec Mural',
    image: 'https://r2.trybonfire.ai/aztec.webp',
  },
  {
    title: 'Pixel Art',
    image: 'https://r2.trybonfire.ai/pixel.webp',
  },
  {
    title: 'Charcoal',
    image: 'https://r2.trybonfire.ai/charcoal.webp',
  },
  {
    title: 'Lovecraftian',
    image: 'https://r2.trybonfire.ai/lovecraftian.webp',
  },
  {
    title: 'Surrealism',
    image: 'https://r2.trybonfire.ai/surrealism.webp',
  },
  {
    title: 'Art Deco',
    image: 'https://r2.trybonfire.ai/artdeco.webp',
  },
  {
    title: 'Art Nouveau',
    image: 'https://r2.trybonfire.ai/artnouveau.webp',
  },
];

type ArtStyleCarouselProps = {
  setSelectedArtStyle: (style: string) => void;
  className?: string;
};

export default function ArtStyleCarousel({ setSelectedArtStyle, className }: ArtStyleCarouselProps) {
  return (
    <div className="flex flex-col w-full pb-10 border-b gap-y-2 border-white/10">
      <div className="flex items-center px-4 font-bold">Art Style</div>
      <Carousel
        className={cn(className)}
        onSelectChange={(index) => {
          setSelectedArtStyle(styles[index].title);
        }}
      >
        <CarouselContent className="w-full h-full">
          {styles.map((style, index) => (
            <CarouselItem
              key={index}
              index={index}
              renderItem={(isActive: boolean) => <ArtStyleCard title={style.title} image={style.image} isActive={isActive} />}
            />
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
