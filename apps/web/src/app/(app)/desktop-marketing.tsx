import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/animation/fadeIn';
import { cn } from '@/lib/utils';
import { StoryExamplesDesktop } from '@/components/pages/lobby/marketing/story-examples-desktop';
import { Icons } from '@/components/icons';

type DesktopMarketingProps = {
  className?: string;
};

export function DesktopMarketing({ className }: DesktopMarketingProps) {
  return (
    <div className={cn('flex flex-col w-full overflow-x-hidden overflow-y-auto overscroll-none', className)}>
      <div className="w-full h-screen">
        <div className="relative w-full h-full">
          <Image
            className="hidden object-cover h-full md:block -z-10 -scale-x-100"
            src="https://r2.trybonfire.ai/bonfirehero6.png"
            width={1792}
            height={1024}
            alt="Hero image"
            quality={100}
          />
          {/* <div className="absolute h-[60%] inset-0 bg-gradient-to-t from-transparent to-transparent backdrop-blur-[1px]" /> */}
          <div className="absolute top-0 block w-full">
            <div className="flex items-center h-12 mx-auto text-lg font-bold text-white max-w-7xl drop-shadow-2xl">Bonfire</div>
          </div>
          <div className="absolute top-0 bottom-0 left-0 right-0 flex items-start justify-center w-full m-auto text-white max-w-7xl h-fit gap-x-6">
            <div className="flex flex-col items-start justify-end w-full mt-5 gap-y-4">
              <div className="w-full max-w-[550px] font-sans text-5xl font-black text-left text-[5.5rem] drop-shadow-2xl">
                <FadeIn>The Ultimate Storyteller</FadeIn>
              </div>
              <div className="w-4/5 max-w-[400px] pb-4 text-left text-base text-neutral-300 drop-shadow-2xl">
                <FadeIn delay={0.4}>An AI narrator that brings your stories to life as a text adventure with images & audio.</FadeIn>
              </div>
              <FadeIn delay={0.9}>
                <Link
                  href="/login"
                  className="flex relative h-12 w-36 items-center justify-center bg-[#ff8f00] rounded-full z-10 text-white hover:scale-105 hover:shadow-lg hover:cursor-pointer"
                >
                  <div className="flex items-center gap-x-1">
                    <div className="text-xl font-bold">Sign Up</div>
                  </div>
                </Link>
              </FadeIn>
            </div>

            <div className="flex justify-center w-full">
              <div className="absolute bottom-[-6rem] left-1/2 flex gap-x-2">
                <div className="flex flex-col gap-y-1">
                  <FadeIn delay={2.5}>
                    <div className="font-bold text-lg">Try an example!</div>
                  </FadeIn>
                  <FadeIn delay={2.5}>
                    <div className="font-extralight text-xs">No signup required.</div>
                  </FadeIn>
                </div>
                <FadeIn delay={2.5}>
                  <Icons.curvedArrow className="absolute right-[-3.5rem] top-[-1rem] w-12 h-12 text-white" />
                </FadeIn>
              </div>

              <StoryExamplesDesktop />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
