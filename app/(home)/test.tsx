'use client'

import { motion, useAnimation, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
const PublicSwimmingSection = dynamic(() => import("./components/public-swimming-section"), {
  ssr: false
})

export default function RadiantBackgroundDiv() {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: false,
    margin: `0% 0% -60% 0px`
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        height: "100%", // Expand to full height
        transition: { duration: .4, ease: "easeInOut" },
      });
    } else {
      controls.start({
        height: "0%", // Collapse back to 0 height when out of view
        transition: { duration: .4, ease: "easeInOut" },
      });
    }
  }, [inView, controls]);

  return (
    <div ref={ref} className="relative min-h-[100vh] w-full overflow-hidden bg-white text-white relative">
      {/* Child div that scrolls up */}
      <motion.div
        animate={controls}
        className="absolute bottom-0 left-0 w-full bg-blue-700 -z-5"
        initial={{ height: "0%" }} // Starts with 0 height
      // style={{
      //   borderBottomLeftRadius: "50% 50px", // Adjust for curve effect
      //   borderBottomRightRadius: "50% 50px", // Adjust for curve effect
      // }}
      />

      <PublicSwimmingSection className="z-5" />
    </div>
  );
}