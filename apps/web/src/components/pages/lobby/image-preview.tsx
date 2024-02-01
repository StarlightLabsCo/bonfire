'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type ImagePreviewProps = {
  imageUrls: string[];
};

export function ImagePreview({ imageUrls }: ImagePreviewProps) {
  const [imageIndex, setImageIndex] = useState(Math.floor(Math.random() * imageUrls.length));
  const [imageURL, setImageURL] = useState(imageUrls[imageIndex]);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const cycleImage = () => {
      setAnimated(true);

      // Set timeout for 2.5 (halfway through the animation) to swap the image
      setTimeout(() => {
        setImageIndex((oldIndex) => {
          const newIndex = (oldIndex + 1) % imageUrls.length;
          setImageURL(imageUrls[newIndex]);

          return newIndex;
        });
      }, 2500);

      // After 5s, end the animation (this will align with the completion of the CSS animation)
      setTimeout(() => {
        setAnimated(false);
      }, 5000);
    };

    cycleImage();

    const interval = setInterval(cycleImage, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full mt-auto">
      <div className="relative">
        <Image
          className={`absolute inset-0 object-cover h-60 w-60 md:h-80 md:w-80  mx-auto rounded-full opacity-100 aspect-1 blur-sm  md:blur-lg ${
            animated ? 'animate-background-transition' : ''
          }`}
          src={imageURL}
          width={1792}
          height={1024}
          alt="Generated image"
        />
        <Image
          className={`relative object-cover h-60 w-60 md:h-80 md:w-80 mx-auto rounded-full aspect-1 -z-1 ${
            animated ? 'animate-image-transition' : ''
          }`}
          src={imageURL}
          width={1792}
          height={1024}
          alt="Generated image"
        />
      </div>
    </div>
  );
}
