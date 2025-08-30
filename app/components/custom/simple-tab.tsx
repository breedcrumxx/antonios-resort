'use client'

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export default function SimpleTabs({
  children,
  className,
  active,
}: {
  children: React.ReactNode[],
  className?: string
  active: string,
}) {

  return (
    // <div className={cn("w-full h-full", className)}>
    //     </div>
    <AnimatePresence mode="wait">
      {React.Children.toArray(children).map((child) => {
        if (React.isValidElement(child) && child.props.name === active) {
          return React.cloneElement(child, { key: active });
        }
        return null;
      })}
    </AnimatePresence>
  );
}

export const SimpleTab = ({ children, className, name }: { name: string, className?: string, children: React.ReactNode }) => {
  return (
    <motion.div className={cn("", className)}
      initial={{ opacity: 0, translateX: '30%' }}
      animate={{ opacity: 1, translateX: '0%' }}
      exit={{ opacity: 0, translateX: '-30%' }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}