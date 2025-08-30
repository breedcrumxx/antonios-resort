'use client'

import { cn } from "@/lib/utils";
import React from "react";
import { BackgroundLines } from "@/app/components/ui/background-lines";
import { Button } from "@/app/components/ui/button";
import a1 from '@/public/about/3-1.jpg';
import VillaInterior from '@/public/home-src/villa-interior.jpg';
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const SkeletonTwo = dynamic(() => import("./skeleton-two"))

export function FeatureSection() {
  const features = [
    {
      title: <span className="font-semibold elegant">Cleanliness</span>,
      description:
        "At our resort, we pride ourselves on maintaining the highest standards of cleanliness. Every corner is meticulously cleaned to ensure a fresh and inviting environment.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: <span className="font-semibold elegant">Nature&apos;s Presence</span>,
      description:
        "Our resort is surrounded by nature, with beautiful trees, fresh air, and calming views. It's the perfect place to relax and feel close to nature",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
    },
    {
      title: <span className="font-semibold elegant">Crew and service</span>,
      description:
        "Our friendly crew is dedicated to making your stay comfortable and enjoyable. With warm smiles and attentive service, we’re always ready to help and ensure you have a great experience.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r  dark:border-neutral-800",
    },
    {
      title: <span className="font-semibold elegant">Still not convinced?</span>,
      description:
        "Book for yourself now, and find out!",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];
  return (
    <div className="w-full flex justify-center">
      <div className="relative p-10 max-w-7xl sm:py-10 sm:px-32">
        <div className="px-0 sm:px-8">
          <h4 className="text-3xl elegant lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
            What we were known for
          </h4>

          <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
            Known for our exceptional service and attention to detail, we ensure every stay is unforgettable.
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
            {features.map((feature, i) => (
              <FeatureCard key={i} className={feature.className}>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
                <div className=" h-full w-full">{feature.skeleton}</div>
              </FeatureCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className=" max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base  max-w-4xl text-left mx-auto",
        "text-neutral-500 text-center font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-white dark:bg-neutral-900 shadow-2xl group h-full aspect-square">
        <div className="flex flex-1 w-full h-full flex-col space-y-2  ">
          <img
            src={VillaInterior.src}
            alt="header"
            width={400}
            height={400}
            className="h-full w-full aspect-square object-cover object-center rounded-sm blur-none group-hover/image:blur-md transition-all duration-200"
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="w-full  mx-auto bg-transparent dark:bg-transparent group h-full">
      <div className="flex flex-1 w-full h-full flex-col space-y-2  relative">
        <img
          src={a1.src}
          alt="header"
          width={400}
          height={400}
          className="w-full h-auto object-center rounded-sm blur-none group-hover/image:blur-md transition-all duration-200"
        />
      </div>
    </div>
  );
};



export const SkeletonFour = () => {
  const router = useRouter()

  return (
    <BackgroundLines className="sm:h-full sm:max-h-[300px] flex flex-col justify-center items-center space-y-2 relative bg-transparent dark:bg-transparent">
      <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-xl font-sans relative font-bold tracking-tight">
        Place a reservation <br /> You will never gonna regret it.
      </h2>
      <Button className="bg-prm z-10" onClick={() => router.push("/package")}>Book now!</Button>
    </BackgroundLines>
  );
};
