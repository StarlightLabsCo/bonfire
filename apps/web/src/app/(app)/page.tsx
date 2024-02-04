import FadeIn from '@/components/animation/fadeIn';
import { Icons } from '@/components/icons';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  return (
    <div className="w-full flex flex-col overflow-x-hidden overflow-y-auto overscroll-none">
      <div className="w-full max-w-5xl h-screen">
        {/* Hero Section */}
        <div className="relative h-3/4">
          <Image
            className="object-cover h-full -z-10"
            src="https://r2.trybonfire.ai/hero.png"
            width={1792}
            height={1024}
            alt="Hero image"
          />
          <div className="absolute bottom-0 h-full max-h-[50%] w-full max-w-5xl bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-0 h-full max-h-[50%] w-full max-w-5xl bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-0 h-full flex flex-col justify-end items-center gap-y-4 text-white">
            <div className="font-black font-sans text-5xl drop-shadow-lg w-full text-center">
              <FadeIn>The Ultimate Storyteller</FadeIn>
            </div>
            <div className="text-sm w-4/5 text-center text-neutral-400 pb-4">
              <FadeIn delay={0.1}>An AI narrator that brings stories to life as a text adventure with images & audio.</FadeIn>
            </div>
          </div>
        </div>

        {/* Call To Action */}
        <div className="relative h-1/4 pt-8">
          <div className="absolute top-0 h-full w-full max-w-5xl bg-gradient-to-b from-black to-transparent" />
          <div className="absolute top-0 h-full w-full -z-10 text-white/5">
            <Icons.topography />
          </div>
          <FadeIn delay={0.2}>
            <Link
              href="/login"
              className="relative h-9 w-24 mx-auto flex items-center justify-center bg-orange-500 rounded-full z-10 text-white"
            >
              <div className="flex items-center gap-x-1">
                <div className="font-bold">Play</div>
              </div>
            </Link>
          </FadeIn>
          <FadeIn delay={0.3} className="absolute bottom-0 w-full h-6 mb-4 text-white">
            <Icons.doubleArrowDown className="mx-auto" />
          </FadeIn>
        </div>
      </div>

      <div className="pl-4 w-3/4 text-white">
        <div className="h-48 pt-4">
          <div className="font-bold text-2xl">Bring Ideas to Life</div>
          <div className="text-xs">
            Whether a few stray ideas, or a full story outline, Bonfire will create an immersive story experience just for you.
          </div>
        </div>
        <div className="h-48 pt-4">
          <div className="font-bold text-2xl">Infinite Possibilities</div>
          <div className="text-xs">Every choice you make directs the story in a new direction.</div>
          <div className="text-xs font-light text-neutral-500">And, we also provide useful action suggestions.</div>
        </div>
        <div className="h-48 pt-4">
          <div className="font-bold text-2xl">Visualize the Story</div>
          <div className="text-xs">Depictions of significant characters, interactions, items, and events at every step of the story.</div>
        </div>
        <div className="h-48 pt-4">
          <div className="font-bold text-2xl">Personalize Your Narrator</div>
          <div className="text-xs">Change the narrator's voice, personality, and storytelling style to match your preferences.</div>
        </div>
        <div className="h-48 pt-4">
          <div className="font-bold text-2xl">Invite Friends</div>
          <div className="text-xs">Shape the story with friends, and let them experience the world you have created.</div>
        </div>
      </div>
    </div>
  );
}
