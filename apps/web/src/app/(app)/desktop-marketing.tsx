import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/animation/fadeIn';
import { cn } from '@/lib/utils';
import { StoryExamplesDesktop } from '@/components/pages/lobby/marketing/story-examples-desktop';

type DesktopMarketingProps = {
  className?: string;
};

export function DesktopMarketing({ className }: DesktopMarketingProps) {
  return (
    <div className={cn('flex flex-col w-full overflow-x-hidden overflow-y-auto overscroll-none', className)}>
      <div className="w-full h-screen">
        <div className="relative w-full h-full">
          <Image
            className="hidden object-cover h-full md:block -z-10 -scale-x-100 blur-[1px]"
            src="https://r2.trybonfire.ai/herodesktop3.webp"
            width={1792}
            height={1024}
            alt="Hero image"
          />
          <div className="absolute bottom-0 w-full h-full max-h-[25%] bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-0 w-full h-full max-h-[25%] bg-gradient-to-t from-black to-transparent" />
          <div className="absolute top-0 block w-full">
            <div className="flex items-center h-12 mx-auto text-lg font-bold text-white max-w-7xl">Bonfire</div>
          </div>
          <div className="absolute top-0 bottom-0 left-0 right-0 flex items-start justify-center w-full m-auto text-white max-w-7xl h-fit gap-x-6">
            <div className="flex flex-col items-start justify-end w-full mt-10 gap-y-4">
              <div className="w-full max-w-[550px] font-sans text-5xl font-black text-left text-[5.5rem] drop-shadow-2xl">
                <FadeIn>The Ultimate Storyteller</FadeIn>
              </div>
              <div className="w-4/5 max-w-[400px] pb-4 text-left text-base text-neutral-300 drop-shadow-2xl">
                <FadeIn delay={0.1}>An AI narrator that brings your stories to life as a text adventure with images & audio.</FadeIn>
              </div>
              <Link
                href="/login"
                className="flex relative h-12 w-36 items-center justify-center bg-[#ff8f00] rounded-full z-10 text-white hover:scale-105 hover:shadow-lg hover:cursor-pointer"
              >
                <div className="flex items-center gap-x-1">
                  <div className="text-xl font-bold">Play</div>
                </div>
              </Link>
            </div>
            <div className="flex justify-center w-full">
              <StoryExamplesDesktop />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
