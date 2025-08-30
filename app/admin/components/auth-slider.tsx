'use client'

import { motion } from "framer-motion"
import { ImagesSlider } from "./ui/image-slider"
import nom1 from '@/public/home-src/nom1.jpg';
import nom2 from '@/public/home-src/nom2.jpg';
import nom3 from '@/public/home-src/nom3.jpg';
import nom4 from '@/public/home-src/nom4.jpg';
import Link from "next/link";
import { logo } from "@/lib/configs/config-file";
import { useRouter } from "next/navigation";

export default function AuthSlider() {

  const imagesrc = [
    nom1.src,
    nom2.src,
    nom3.src,
    nom4.src,
  ]

  return (
    <ImagesSlider className="h-full text-center" images={imagesrc}>
      <motion.div
        initial={{
          opacity: 0,
          y: -80,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="z-50 h-full sm:w-screen w-full flex flex-col p-5"
      >
        <motion.div className="h-[100px]">
          <Link className="h-full" href="/" prefetch>
            <img
              className="h-full aspect-square"
              src={logo} alt=""
            />
          </Link>
        </motion.div>
        <motion.div className="flex-grow">
        </motion.div>
        <Link href="/" prefetch>
          <motion.p className="font-bold w-full text-5xl gold-text bg-clip-text text-white elegant">
            <span className="text-prm">A</span>ntonio&apos;s <span className="text-prm">R</span>esort
          </motion.p>
        </Link>
        <motion.p className="text-sm text-white">a calm, relaxing and memorable experience</motion.p>
      </motion.div>
    </ImagesSlider>
  )
}