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
    <div className="flex flex-col w-full overflow-x-hidden overflow-y-auto overscroll-none">
      <div className="w-full h-screen">
        {/* Hero Section */}
        <div className="relative w-full h-3/4 md:h-full">
          <Image
            className="object-cover h-full md:hidden -z-10"
            src="https://r2.trybonfire.ai/hero.png"
            width={1792}
            height={1024}
            alt="Hero image"
          />
          <Image
            className="hidden object-cover h-full md:block -z-10 -scale-x-100"
            src="https://r2.trybonfire.ai/herodesktop2.png" //desktophero.png
            width={1792}
            height={1024}
            alt="Hero image"
          />
          <div className="absolute bottom-0 w-full h-full max-h-[50%] md:max-h-[25%] bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-0 w-full h-full max-h-[50%] md:max-h-[25%] bg-gradient-to-t from-black to-transparent" />
          <div className="absolute top-0 hidden w-full md:block">
            <div className="flex items-center h-10 mx-auto text-lg font-bold text-white max-w-7xl">Bonfire</div>
          </div>
          <div className="absolute bottom-0 flex items-end justify-center w-full h-full text-white md:max-w-7xl md:left-0 md:right-0 md:top-0 md:m-auto md:h-fit gap-x-6 md:items-start md:mt-[15%]">
            <div className="flex flex-col items-center justify-end w-full md:items-start gap-y-4">
              <div className="w-full max-w-[550px] font-sans text-5xl font-black text-center md:text-left md:text-[5.5rem] drop-shadow-lg md:drop-shadow-2xl">
                <FadeIn>The Ultimate Storyteller</FadeIn>
              </div>
              <div className="w-4/5 max-w-[400px] pb-4 text-sm text-center md:text-left md:text-base text-neutral-400 md:text-neutral-300 md:drop-shadow-2xl">
                <FadeIn delay={0.1}>An AI narrator that brings your stories to life as a text adventure with images & audio.</FadeIn>
              </div>
              <Link
                href="/login"
                className="hidden md:flex relative h-9 w-24 items-center justify-center bg-[#ff8f00] rounded-full z-10 text-white"
              >
                <div className="flex items-center gap-x-1">
                  <div className="font-bold">Play</div>
                </div>
              </Link>
            </div>
            <div className="flex-col items-center hidden w-full md:flex">
              <video autoPlay loop muted playsInline className="w-full rounded-3xl">
                <source src="https://r2.trybonfire.ai/BonfireTimelapse.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <FadeIn delay={0.3} className="absolute bottom-0 hidden w-full h-6 mb-4 text-white cursor-pointer md:block">
            <ScrollArrow scrollTo="ideas" />
          </FadeIn>
        </div>

        {/* Call To Action */}
        <div className="relative w-full pt-8 h-1/4 md:hidden">
          <div className="absolute top-0 w-full h-full bg-gradient-to-b from-black to-transparent" />
          <div className="absolute top-0 w-full h-full -z-10 text-white/5">
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
      <div className="flex flex-col w-full max-w-5xl mx-auto mb-20 text-white gap-y-4">
        <div className="w-3/4 px-4 pt-4" id="ideas">
          <div className="text-2xl font-bold">Bring Ideas to Life</div>
          <div className="text-xs text-neutral-400">
            Whether a few stray ideas, or a full outline, Bonfire creates an immersive story just for you.
          </div>
        </div>
        <div className="w-full px-4 pt-4">
          <div className="w-3/4 text-2xl font-bold">Infinite Possibilities</div>
          <div className="w-3/4 text-xs text-neutral-400">Every choice you make directs the story in a new direction.</div>
          <ChoicesAnimation className="my-6" />
          <div className="w-3/4 text-xs text-neutral-400">
            If you don&apos;t like the suggested actions, you can write whatever you want!
          </div>
        </div>
        <div className="pt-4">
          <div className="w-3/4 px-4 text-2xl font-bold">Visualize the Story</div>
          <div className="w-3/4 px-4 text-xs text-neutral-400">Depict characters, items, and events at every step of the story.</div>
          <MarqueeImages className="mt-5" />
        </div>
        <div className="w-full px-4 pt-4">
          <div className="w-3/4 text-2xl font-bold">Personalize Your Narrator</div>
          <div className="w-3/4 text-xs text-neutral-400">Tailor the narrator&apos;s voice, personality, and style to what you want.</div>
          <VoiceExample className="mt-5" />
        </div>
        <div className="px-4 pt-4">
          <div className="text-2xl font-bold">Invite Friends</div>
          <div className="text-xs text-neutral-400">Shape the story with friends, and let them experience the world you have created.</div>
          <MultiplayerAnimation className="mt-12 mb-6" />
        </div>
        <div className="pt-4">
          <div className="px-4 text-2xl font-bold">Try it for yourself</div>
          <div className="px-4 text-xs text-neutral-400">No signup required!</div>
          <StoryExamples className="w-full mt-5" />
        </div>
      </div>
    </div>
  );
}
