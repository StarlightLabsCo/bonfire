import Image from 'next/image';
import Marquee from '@/components/magicui/marquee';
import { cn } from '@/lib/utils';

const imagesFirstHalf = [
  'https://r2.trybonfire.ai/clpxt1kug000ldstwa6x9z4uj.png',
  'https://r2.trybonfire.ai/clq0i2c55003k10p45oea1phw.png',
  'https://r2.trybonfire.ai/clprxuk7z0008ycvkkl02frz3.png',
  'https://r2.trybonfire.ai/clps69ecz0008crf3bpitvzuw.png',
  'https://r2.trybonfire.ai/clpug91yf000k6dbxobkj9mn3.png',
  'https://r2.trybonfire.ai/clpxoq7hu001ksmb5wzq4dbti.png',
  'https://r2.trybonfire.ai/clpt0t9ux0009ghn3qhyiuo7g.png',
  'https://r2.trybonfire.ai/clpt2hzhq0008mh8hdvso13rr.png',
  'https://r2.trybonfire.ai/clpt2uovc0008idkoa0ay5ze8.png',
  'https://r2.trybonfire.ai/clpt5bm39000813mmychujul3.png',
  'https://r2.trybonfire.ai/clpz9c2cf000759mdycnlc9ro.png',
  'https://r2.trybonfire.ai/clpuaj26g0008drhfthnok7wi.png',
  'https://r2.trybonfire.ai/clpueq9ws0008r5ne0atnlr7c.png',
  'https://r2.trybonfire.ai/clpufp0kk0008cm3lbdl1lxzx.png',
  'https://r2.trybonfire.ai/clpug0hwi00085nv4p0ycfski.png',
  'https://r2.trybonfire.ai/clpzoi323000jlexebhib4nec.png',
  'https://r2.trybonfire.ai/clq22zqjp0019nrsubtsurv5x.png',
  'https://r2.trybonfire.ai/clpzut8m9007vgejttfokhzvw.png',
  'https://r2.trybonfire.ai/clq15dnag003sz6yj8whh27gu.png',
  'https://r2.trybonfire.ai/clpxnbra1000wsmb5r4jbjtyw.png',
  'https://r2.trybonfire.ai/clpyujdrp001znvo1b7qrkdiw.png',
  'https://r2.trybonfire.ai/clpypszyk000av2r8it8zx44p.png',
  'https://r2.trybonfire.ai/clpukixc100189joqxr55k29s.png',
  'https://r2.trybonfire.ai/clpulg7po002j9joqgfwcbjfc.png',
  'https://r2.trybonfire.ai/clpxwj2dj000v97obte1zz3ny.png',
  'https://r2.trybonfire.ai/clq2g1qc2004nwuzxquznzpy7.png',
  'https://r2.trybonfire.ai/clq2gb6se005gwuzx0fi8zdfm.png',
  'https://r2.trybonfire.ai/clq2h1f3d006s3qxqphk4nsaq.png',
  'https://r2.trybonfire.ai/clq2kiss7007sway5s9zskest.png',
  'https://r2.trybonfire.ai/clq2lrmu00085way5iwejv87t.png',
  'https://r2.trybonfire.ai/clq2m0ju4009iway5jj48ps9e.png',
];

const imagesSecondHalf = [
  'https://r2.trybonfire.ai/clq23uc7d0030hd843q09iqti.png',
  'https://r2.trybonfire.ai/clq1oo7mk000713glhka9zw7q.png',
  'https://r2.trybonfire.ai/clpuzkv6b000iero664fme9w8.png',
  'https://r2.trybonfire.ai/clpzdqn3q000agejtfyux99xy.png',
  'https://r2.trybonfire.ai/clq23d5ja000ohd84z6elvb2z.png',
  'https://r2.trybonfire.ai/clpvyn9ew000xer5rsvp0pv69.png',
  'https://r2.trybonfire.ai/clpvyqqnj0019er5r5vq9ryxy.png',
  'https://r2.trybonfire.ai/clq22wby70026wuzxge05llpb.png',
  'https://r2.trybonfire.ai/clq1thgqu000h7hvv00iosotb.png',
  'https://r2.trybonfire.ai/clpw3s88z000kbpnk7e3c5tcv.png',
  'https://r2.trybonfire.ai/clq1zaf9x000xws209h4dvj4j.png',
  'https://r2.trybonfire.ai/clpw66y3t001w3esbacg0fjt1.png',
  'https://r2.trybonfire.ai/clq1wjvt4001cy1r2e795n7vl.png',
  'https://r2.trybonfire.ai/clq20kq00001i3qxqnv6mvgtb.png',
  'https://r2.trybonfire.ai/clpzr5jiy004flexe1jcqem3n.png',
  'https://r2.trybonfire.ai/clq0h66da002l10p47iovdj9p.png',
  'https://r2.trybonfire.ai/clpulix6f002v9joqras3wta7.png',
  'https://r2.trybonfire.ai/clq1wlkdl001my1r28kpu3w5z.png',
  'https://r2.trybonfire.ai/clpyrggv5000yv2r8f3n08pmr.png',
  'https://r2.trybonfire.ai/clpxjlnvy000xtk2erx8dl8pz.png',
  'https://r2.trybonfire.ai/clq0hwpbk003810p4gfqa1tii.png',
  'https://r2.trybonfire.ai/clpxn8oea000ksmb5axr6m77x.png',
  'https://r2.trybonfire.ai/clq1ziz0m00083qxqgqzjpbbj.png',
  'https://r2.trybonfire.ai/clq1zm4f9000ahd84n7f3hw50.png',
  'https://r2.trybonfire.ai/clq1zny0s00195s27ujg70xud.png',
  'https://r2.trybonfire.ai/clq23d5ja000ohd84z6elvb2z.png',
  'https://r2.trybonfire.ai/clq2fgzc0004yws205qlc4yhm.png',
  'https://r2.trybonfire.ai/clq23fb0n0017hd84o4mxtuqs.png',
  'https://r2.trybonfire.ai/clq29maov002phf1izu65ngj8.png',
  'https://r2.trybonfire.ai/clq2fhg8j005zkdber5ymwpz1.png',
  'https://r2.trybonfire.ai/clq2fhhh3005ahd84qubls9b6.png',
  'https://r2.trybonfire.ai/clq2fvwtc004u3qxqunfyf4yw.png',
];

export function MarqueeImages({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background shadow-2xl',
        className,
      )}
    >
      <Marquee className="[--gap:1rem]">
        {imagesFirstHalf.map((image, idx) => (
          <Image className="rounded-lg h-24" key={idx} src={image} alt="Example generated image" width={1792} height={1024} />
        ))}
      </Marquee>
      <Marquee className="[--gap:1rem]" reverse>
        {imagesSecondHalf.map((image, idx) => (
          <Image className="rounded-lg h-24" key={idx} src={image} alt="Example generated image" width={1792} height={1024} />
        ))}
      </Marquee>
    </div>
  );
}
