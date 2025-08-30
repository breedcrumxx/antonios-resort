'use client'

import { motion } from "framer-motion";

export default function SimpleStep({ pos, stepCount }: { pos: number, stepCount: number }) {

  const calculateOffset = (pos: number) => pos * 10;

  return (
    <div className="flex gap-1 relative">
      <motion.div
        className="absolute h-[5px] w-[10px] rounded-sm bg-gray-500"
        animate={{ x: calculateOffset(pos) }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      ></motion.div>
      {Array(stepCount).fill(0).map((_, i) => (
        <Step
          pos={pos}
          order={i}
          key={i}
        />
      ))}
    </div>
  )
}

export const Step = ({ pos, order }: { pos: number, order: number }) => {

  return (
    <motion.div
      className="h-[5px] rounded-sm bg-gray-300"
      style={{ width: pos === order ? "10px" : "6px" }}
      animate={{ width: pos === order ? "10px" : "6px" }}
      transition={{ duration: 0.3 }}
    ></motion.div>
  )
}