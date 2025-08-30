'use client'

import clsx from "clsx"
import { useState } from "react"

export default function Retractable({ children, className }: { children: React.ReactNode, className?: string }) {

  // states
  const [retract, setRetract] = useState<boolean>(true)

  return (
    <div className={clsx(`w-full min-h-[500px] p-5 px-10 bg-white border-[1px] overflow-hidden relative transition duration-500 ease-in-out ${className}`, { "h-auto": !retract, "max-h-[500px]": retract })}>
      {children}
      {
        !retract && (
          <>
            <br />
            <br />
          </>
        )
      }
      <div className="absolute bottom-0 left-0 w-full py-5 text-center text-white bg-gradient-to-t from-black/60 to-black/0 cursor-pointer" onClick={() => setRetract((prev) => !prev)}>
        <p>Click to {retract ? "expand" : "collapse"}</p>
      </div>
    </div>
  )
}