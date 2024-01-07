import Image from 'next/image';

export function FeaturedStoryTemplateCard({ isActive }: { isActive: boolean }) {
  return (
    <div className="w-full h-80 flex">
      <div className="relative w-1/2 h-full">
        <Image
          src="https://r2.trybonfire.ai/clr24ecwf008vlau6n7q9ktin.png"
          alt="Test image"
          layout="fill"
          objectFit="cover"
          className="rounded-2xl"
        />
      </div>
      <div className={`relative w-1/2 h-full pl-6 flex flex-col gap-y-2`}>
        <h2 className={`text-2xl font-medium ${isActive ? 'animate-fade-in-bottom-0' : ''}`}>Title</h2>
        <div className={`flex gap-x-2 ${isActive ? 'animate-fade-in-bottom-1' : ''}`}>
          <div className={`border border-white/10 rounded-full px-4 py-1 text-xs font-light`}>Comfy</div>
          <div className={`border border-white/10 rounded-full px-4 py-1 text-xs font-light`}>Fantasy</div>
        </div>
        <div className={`text-xs font-light mt-2 ${isActive ? 'animate-fade-in-bottom-2' : ''}`}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Elementum nisi quis eleifend quam adipiscing vitae proin sagittis. Ut consequat semper viverra nam. Porttitor leo a diam
          sollicitudin tempor id. Nisl nisi scelerisque eu ultrices vitae auctor eu augue ut. Lectus sit amet est placerat in egestas erat
          imperdiet. Cum sociis natoque penatibus et. Non curabitur gravida arcu ac tortor dignissim convallis aenean. Sodales ut etiam sit
          amet nisl purus in mollis nunc. Semper eget duis at tellus at urna condimentum. Vitae turpis massa sed elementum tempus egestas
          sed sed. In iaculis nunc sed augue. Tincidunt augue interdum velit euismod in pellentesque massa placerat duis.
        </div>
        <div className={`mt-auto w-full flex justify-between items-center ${isActive ? 'animate-fade-in-bottom-3' : ''}`}>
          <div className={`flex gap-x-2`}>
            <img
              className="w-10 h-10 rounded-full"
              src="https://pbs.twimg.com/profile_images/1512238883169210368/BetmGg56_400x400.jpg"
              alt="DeveloperHarris"
              width={400}
              height={400}
            />
            <div className={`flex flex-col gap-y-1`}>
              <div className="text-sm font-medium">DeveloperHarris</div>
              <div className="text-xs font-light">Created 5 weeks ago</div>
            </div>
          </div>
          <div className="bg-orange-500 px-4 py-1 rounded-full">Play</div>
        </div>
      </div>
    </div>
  );
}
