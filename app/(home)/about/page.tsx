'use client'

import { Timeline } from "@/app/components/ui/timeline";

// 2022 bracket
import f1 from '@/public/about/1-1.jpg';
import f2 from '@/public/about/1-2.jpg';
import f3 from '@/public/about/1-3.jpg';
// late 2022
import a1 from '@/public/about/2-1.jpg';
import a2 from '@/public/about/2-2.jpg';
import a3 from '@/public/about/2-3.jpg';
import a4 from '@/public/about/2-4.jpg';
// 2023
import b1 from '@/public/about/3-1.jpg';
import b2 from '@/public/about/3-2.jpg';
import b3 from '@/public/about/3-3.jpg';
import b4 from '@/public/about/3-4.jpg';
// 2023
import ribbon from '@/public/about/1.jpg';
import final from '@/public/about/3-1.jpg';
import nom3 from '@/public/home-src/nom3.jpg';
import eventcenter from '@/public/home-src/event-center.jpg';
import clsx from "clsx";
import { useState } from "react";
import { Switch } from "@/app/components/ui/switch";

const Polaroids = ([i1, i2, i3, i4]: string[], active = false) => {
  return (
    <>
      <div className="h-28 md:h-44 lg:h-60 p-2 pb-10 border w-full transition-all -rotate-12 bg-white hover:rotate-0">
        <div className="w-full h-full bg-gray-500">
          <img
            src={i1}
            alt="hero template"
            width={500}
            height={500}
            className={clsx("rounded-lg object-cover h-full w-full grayscale hover:grayscale-0 transition-all", {
              "grayscale-0": active
            })}
          />
        </div>
      </div>
      <div className="h-28 md:h-44 lg:h-60 p-2 pb-10 border w-full transition-all rotate-12 bg-white hover:rotate-0">
        <div className="w-full h-full bg-gray-500">
          <img
            src={i2}
            alt="feature template"
            width={500}
            height={500}
            className={clsx("rounded-lg object-cover h-full w-full grayscale hover:grayscale-0 transition-all", {
              "grayscale-0": active
            })}
          />
        </div>
      </div>
      <div className="h-28 md:h-44 lg:h-60 p-2 pb-10 border w-full transition-all -rotate-12 bg-white hover:rotate-0">
        <div className="w-full h-full bg-gray-500">
          <img
            src={i3}
            alt="bento template"
            width={500}
            height={500}
            className={clsx("rounded-lg object-cover h-full w-full grayscale hover:grayscale-0 transition-all", {
              "grayscale-0": active
            })}
          />
        </div>
      </div>
      <div className="h-28 md:h-44 lg:h-60 p-2 pb-10 border w-full transition-all rotate-12 bg-white hover:rotate-0">
        <div className="w-full h-full bg-gray-500">
          <img
            src={i4}
            alt="cards template"
            width={500}
            height={500}
            className={clsx("rounded-lg object-cover h-full w-full grayscale hover:grayscale-0 transition-all", {
              "grayscale-0": active
            })}
          />
        </div>
      </div>
    </>
  )
}

export default function AboutPage() {

  // states
  const [start, setStart] = useState<boolean>(false)

  const data = [
    {
      title: "2022",
      content: (
        <div>
          <p className="text-2xl sm:text-6xl font-bold mb-4 elegant">
            When Antonio&apos;s Resort entered the business.
          </p>
          <p className="text-neutral-800 font-normal mb-8">
            Antonio&apos;s Resort was once a dream we held dear. The name itself is a tribute to my grandfather, from whom the vision for the resort originated.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {
              Polaroids([f1.src, f2.src, f3.src, ribbon.src])
            }
          </div>
        </div>
      ),
    },
    {
      title: "Late 2022",
      content: (
        <div>
          <p className="text-2xl sm:text-6xl font-bold mb-4 elegant">
            We are now receiving smiles from our clients
          </p>
          <p className="text-neutral-800 font-normal mb-8">
            We are gaining new clients, and the business is finally getting the attention it deserves. Your smiles inspire us to continue delivering excellent service.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {
              Polaroids([a1.src, a2.src, a3.src, a4.src])
            }
          </div>
        </div>
      ),
    },
    {
      title: "2023",
      content: (
        <div>
          <p className="text-2xl sm:text-6xl font-bold mb-4 elegant">
            We continue to grow
          </p>
          <p className="text-neutral-800 font-normal mb-8">
            We continue to grow, with more clients entrusting us with their plans. In return, we provide them with unforgettable experiences.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {
              Polaroids([b1.src, b2.src, b3.src, b4.src])
            }
          </div>
        </div>
      ),
    },
    {
      title: "Present",
      content: (
        <div>
          <p className="text-2xl sm:text-6xl font-bold mb-4 elegant">
            What we did before, will be greater than we will do tomorrow
          </p>
          <p className="text-neutral-800 font-normal mb-8">
            From Mrs. Diosa and Antonios Resort Familty
          </p>
          <div className="grid grid-cols-2 gap-4">
            {
              Polaroids([ribbon.src, eventcenter.src, nom3.src, final.src], true)
            }
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-w-screen">
      <br />
      <br />
      <br />
      <div className="w-full flex justify-center">
        <div className="w-[1200px] flex space-x-4 text-lg font-semibold items-center justify-end">
          <p>Past</p>
          <Switch checked={start} onCheckedChange={(e: boolean) => setStart(e as boolean)} />
          <p>Present</p>
        </div>
      </div>
      <Timeline data={(() => start ? data.reverse() : data)()} />
    </div>
  );
}