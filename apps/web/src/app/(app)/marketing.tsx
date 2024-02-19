import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import FadeIn from '@/components/animation/fadeIn';
import { MarqueeImages } from '@/components/marquee-images';
import { VoiceExample } from '@/components/pages/lobby/marketing/voice-example';
import { ScrollArrow } from '@/components/pages/lobby/marketing/scroll-arrow';
import { StoryExamples } from '@/components/pages/lobby/marketing/story-examples';
import { MultiplayerAnimation } from '@/components/pages/lobby/marketing/multiplayer-animation';
import { ChoicesAnimation } from '@/components/pages/lobby/marketing/choices-animation';

export default function Marketing() {
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
              <FadeIn delay={0.1}>An AI narrator that brings your stories to life as a text adventure with images & audio.</FadeIn>
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
              className="relative h-9 w-24 mx-auto flex items-center justify-center bg-[#ff8f00] rounded-full z-10 text-white"
            >
              <div className="flex items-center gap-x-1">
                <div className="font-bold">Play</div>
              </div>
            </Link>
          </FadeIn>
          <FadeIn delay={0.3} className="absolute bottom-0 w-full h-6 mb-4 text-white">
            <ScrollArrow scrollTo="ideas" />
          </FadeIn>
        </div>
      </div>

      {/* Sectionals */}
      <div className="w-full text-white flex flex-col gap-y-4 mb-20">
        <div className="px-4 pt-4 w-3/4" id="ideas">
          <div className="font-bold text-2xl">Bring Ideas to Life</div>
          <div className="text-xs text-neutral-400">
            Whether a few stray ideas, or a full outline, Bonfire creates an immersive story just for you.
          </div>
        </div>
        <div className="px-4 pt-4 w-full">
          <div className="w-3/4 font-bold text-2xl">Infinite Possibilities</div>
          <div className="w-3/4 text-xs text-neutral-400">Every choice you make directs the story in a new direction.</div>
          <ChoicesAnimation className="my-6" />
          <div className="w-3/4 text-xs text-neutral-400">
            If you don&apos;t like the suggested actions, you can write whatever you want!
          </div>
        </div>
        <div className="pt-4">
          <div className="w-3/4 px-4 font-bold text-2xl">Visualize the Story</div>
          <div className="w-3/4 px-4 text-xs text-neutral-400">Depict characters, items, and events at every step of the story.</div>
          <MarqueeImages className="mt-5" />
        </div>
        <div className="px-4 pt-4 w-full">
          <div className="w-3/4 font-bold text-2xl">Personalize Your Narrator</div>
          <div className="w-3/4 text-xs text-neutral-400">Tailor the narrator&apos;s voice, personality, and style to what you want.</div>
          <VoiceExample className="mt-5" />
        </div>
        <div className="px-4 pt-4">
          <div className="font-bold text-2xl">Invite Friends</div>
          <div className="text-xs text-neutral-400">Shape the story with friends, and let them experience the world you have created.</div>
          <MultiplayerAnimation className="mt-12 mb-6" />
        </div>
        <div className="pt-4">
          <div className="px-4 font-bold text-2xl">Try it for yourself</div>
          <div className="px-4 text-xs text-neutral-400">No signup required!</div>
          <StoryExamples className="mt-5 w-full" />
        </div>
      </div>
    </div>
  );
}
