"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";
import { useRef } from "react";

import smile1 from '@/public/smile/smile1.jpg'
import smile2 from '@/public/smile/smile2.jpg'
import smile3 from '@/public/smile/smile3.jpg'
import smile4 from '@/public/smile/smile4.jpg'
import smile5 from '@/public/smile/smile5.jpg'
import smile6 from '@/public/smile/smile6.jpg'
import smile7 from '@/public/smile/smile7.jpg'
import smile8 from '@/public/smile/smile8.jpg'
import smile9 from '@/public/smile/smile9.jpg'
import smile10 from '@/public/smile/smile10.jpg'

import smile11 from '@/public/smile/smile11.jpg'
import smile12 from '@/public/smile/smile12.jpg'
import smile13 from '@/public/smile/smile13.jpg'
import smile14 from '@/public/smile/smile14.jpg'
import smile15 from '@/public/smile/smile15.jpg'
import smile16 from '@/public/smile/smile16.jpg'
import smile17 from '@/public/smile/smile17.jpg'
import smile18 from '@/public/smile/smile18.jpg'
import smile19 from '@/public/smile/smile19.jpg'
import smile20 from '@/public/smile/smile20.jpg'

import nom1 from '@/public/home-src/nom1.jpg';

export default function ParalaxEnding() {

  const images = [
    smile1.src,
    smile2.src,
    smile3.src,
    smile4.src,
    smile5.src,
    smile6.src,
    smile7.src,
    smile8.src,
    smile9.src,
    smile10.src,
    smile11.src,
    smile12.src,
    smile13.src,
    smile14.src,
    smile15.src,
    smile16.src,
    smile17.src,
    smile18.src,
    smile19.src,
    smile20.src,
  ]

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -5000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -4000]),
    springConfig
  );

  const opacity1 = useSpring(
    useTransform(scrollYProgress, [0, 0.2, 0.5], [0.2, 1, 0]),
    springConfig
  );
  const opacity2 = useSpring(
    useTransform(scrollYProgress, [.5, .65, .9], [0, 1, 1]),
    springConfig
  );
  const opacity3 = useTransform(scrollYProgress, [0, .8, .9, 1], [1, 1, 0, 0])

  return (
    <>
      <motion.div
        style={{
          opacity: opacity3,
        }}
        className="hidden sticky top-0 min-h-screen flex flex-col items-center justify-center space-y-5 relative overflow-hidden sm:flex"
      >

        <div className="w-full h-full absolute opacity-10 grayscale -z-4">
          <div className="w-full h-full relative">
            <motion.img
              src={nom1.src}
              height="600"
              width="600"
              className="object-cover object-center absolute h-full w-full inset-0"
            />
          </div>
        </div>

        <div className="w-[1200px]">
          <motion.p
            style={{
              opacity: opacity1
            }}
            className="absolute top-1/2 left-32 -translate-y-2/4 z-50 font-bold elegant text-7xl"> We&apos;ve brought smiles <br /> to countless faces...</motion.p>
          <motion.p
            style={{
              opacity: opacity2
            }}
            className="absolute top-1/2 left-32 -translate-y-2/4 z-50 font-bold elegant text-7xl"> Only left is <br /> for you to...</motion.p>

          <div className="flex gap-4 justify-end">
            <motion.div className="h-[100vh] space-y-50 flex flex-col gap-4 pt-10">
              {images.map((item: string, i: number) => (
                <motion.div
                  style={{
                    y: translateXReverse
                  }}
                  key={`image-${i}`}
                  className="min-h-[250px] w-[200px] px-2 pt-2 pb-10 border self-end bg-orange-300/10"
                >
                  <div className="h-full w-full bg-gray-500 relative">
                    <motion.img
                      src={item}
                      height="600"
                      width="600"
                      className="object-cover object-center absolute h-full w-full inset-0"
                      alt={`image-${i}`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div className="h-[100vh] space-y-50 flex flex-col pr-[100px] gap-4">
              {images.reverse().map((item: string, i: number) => (
                <motion.div
                  style={{
                    y: translateX
                  }}
                  key={`image-${i}`}
                  className="min-h-[250px] w-[200px] px-2 pt-2 pb-10 border self-end bg-orange-300/10"
                >
                  <div className="h-full w-full bg-gray-500 relative">
                    <img
                      src={item}
                      height="600"
                      width="600"
                      className="object-cover object-center absolute h-full w-full inset-0"
                      alt={`image-${i}`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

      </motion.div>
      <div
        ref={ref}
        className="hidden sm:block h-[700vh]"
      >
      </div>
    </>
  );
}



