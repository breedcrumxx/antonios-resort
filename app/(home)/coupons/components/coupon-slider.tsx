'use client'

import { ImagesSlider } from "@/app/admin/components/ui/image-slider";
import nom1 from '@/public/home-src/nom1.jpg';
import nom2 from '@/public/home-src/nom2.jpg';
import nom3 from '@/public/home-src/nom3.jpg';
import nom4 from '@/public/home-src/nom4.jpg';
import { motion } from "framer-motion";


export default function CouponSlider() {

  const test = [
    nom1.src,
    nom2.src,
    nom3.src,
    nom4.src,
  ]

  return (
    <ImagesSlider className="h-[50vh] bg-prm" images={test}>
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
        className="z-50 h-[50vh] w-full flex flex-col justify-center p-5"
      >
        <motion.div className="flex-grow"></motion.div>
        <motion.p className="text-white font-thin text-6xl text-white"><span className="text-prm">AR</span> Coupons</motion.p>
        <motion.p className="text-white font-thin text-xl text-white"> Enjoy More Spend Less</motion.p>
      </motion.div>
    </ImagesSlider>
  )
}