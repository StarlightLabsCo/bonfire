import GridPattern from '@/components/animated-grid';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  return (
    <>
      <div className="w-full flex flex-col min-h-screen">
        <div className="relative w-full max-w-5xl">
          <Image
            className="object-cover h-[75dvh] w-full -z-1"
            src="https://r2.trybonfire.ai/hero.png"
            width={1792}
            height={1024}
            alt="Hero image"
          />
          <div className="absolute bottom-0 h-full max-h-[50%] w-full max-w-5xl bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-0 pl-4 h-full flex flex-col justify-end gap-y-2 text-white">
            <div className="font-black font-sans text-4xl drop-shadow-lg">The Ultimate Storyteller</div>
            <div className="text-xs w-3/4 text-left">
              Bonfire is an AI narrator that brings stories to life as a text adventure with images & audio.
            </div>
          </div>
        </div>
        <div className="relative h-full pt-4">
          <div className="absolute top-0 h-full max-h-[75%] w-full max-w-5xl bg-gradient-to-b from-black to-transparent" />
          <Link
            href="/login"
            className="relative h-8 w-24 ml-4 flex items-center justify-center bg-orange-500 rounded-full z-10 text-white"
          >
            <div className="flex items-center gap-x-1">
              <div className="font-bold">Start</div>
              <Icons.arrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>
      <GridPattern className={cn('w-full h-full -z-10')} maxOpacity={0.3} />
    </>
  );
}
