'use client';

import { useState, useEffect } from "react";
import { ImagesSlider } from "@/app/admin/components/ui/image-slider";
import nom1 from '@/public/home-src/nom1.jpg';
import nom2 from '@/public/home-src/nom2.jpg';
import nom3 from '@/public/home-src/nom3.jpg';
import nom4 from '@/public/home-src/nom4.jpg';
import { motion } from "framer-motion";
import { cn } from "@nextui-org/system";

export default function ImageSlider() {
  const [showSlider, setShowSlider] = useState(true);

  const imagesrc = [
    nom1.src,
    nom2.src,
    nom3.src,
    nom4.src,
  ];

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const threshold = window.innerHeight * 2; // You can adjust this threshold
      if (scrollY > threshold) {
        setShowSlider(false); // Hide slider after scrolling past threshold
      } else {
        setShowSlider(true); // Show slider when above threshold
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return showSlider ? (
    <div
      className={"h-max sm:h-[100vh] w-screen max-w-screen overflow-hidden fixed top-0 left-0 -z-5"}
      style={{
        perspective: "1000px",
      }}
    >
      <div className="relative w-screen h-max sm:h-full">
        <div
          className={cn("absolute inset-0 bg-black/40 z-5")}
        />
        <div className="text-center sm:text-left absolute h-full p-4 sm:p-10 z-10 flex flex-col">
          <div className="flex-grow"></div>
          <p className="text-white font-regular tracking-wider text-4xl sm:text-8xl elegant gold-text">
            <span className="">A</span>NTONIO&apos;S <span className="text-prm">R</span>ESORT
          </p>
          <p className="text-white font-thin text-xl text-white">
            a calm, relaxing and memorable experience
          </p>
        </div>
        <img
          src={nom1.src}
          alt=""
          className="inset-0 w-full h-full object-cover object-center"
        />
      </div>
    </div>
  ) : null;
}


