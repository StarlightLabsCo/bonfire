import { Icons } from '@/components/icons';
import { Instance } from 'database';
import Image from 'next/image';
import Link from 'next/link';

type DashboardProps = {
  instance: Instance & {
    messages: {
      content: string;
    }[];
  };
};

export default function Dashboard({ instance }: DashboardProps) {
  return (
    <div className="h-[calc(100dvh-2.5rem)] w-full mt-10 px-4 py-2 flex flex-col gap-y-2">
      <div className="relative h-3/4 w-full border border-white rounded-xl">
        <Image
          src={instance.messages[0].content}
          alt="Ongoing story"
          width={1792}
          height={1024}
          className="rounded-xl h-full object-cover"
        />
        <div className="absolute top-[-1px] left-[-1px] h-[20px] w-[150px] bg-white z-10 rounded-tl-xl rounded-br-xl drop-shadow-lg text-black text-xs font-black flex items-center justify-center">
          Previous Adventure
        </div>
        <div className="absolute bottom-0 h-full max-h-[70%] w-full max-w-5xl bg-gradient-to-t from-black to-transparent rounded-xl" />
        <div className="w-full absolute bottom-0 h-full flex flex-col justify-end text-white px-4">
          <div className="font-black text-xl drop-shadow-lg">{instance.name}</div>
          <div className="text-xs text-neutral-400 pb-2">{instance.description}</div>
          <div className="w-full flex justify-end items-center mb-5">
            <Link
              href={`/instances/${instance.id}`}
              className="relative h-9 w-32 flex items-center justify-center bg-[#ff8f00] rounded-full z-10 text-white"
            >
              <div className="font-bold">Resume</div>
              <Icons.arrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <div className="relative h-1/4 w-full border border-white rounded-xl">
        <Image
          src="https://r2.trybonfire.ai/map.webp"
          alt="Ongoing story"
          width={1792}
          height={1024}
          className="rounded-xl h-full object-cover"
        />
        <div className="absolute bottom-0 h-full max-h-[70%] w-full bg-gradient-to-t from-black to-transparent rounded-xl" />
        <div className="absolute bottom-0 w-full flex items-center text-white px-4 pb-5">
          <div className="font-black text-xl drop-shadow-lg z-10 grow">New adventure?</div>
          <Link href="/lobby" className="relative h-9 w-32 flex items-center justify-center bg-[#ff8f00] rounded-full z-10 text-white">
            <div className="font-bold">Create</div>
            <Icons.arrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
