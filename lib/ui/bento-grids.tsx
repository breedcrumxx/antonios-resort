
import { cn } from "@/lib/utils/cn";
import React from "react";

export function BentoGrid({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "grid gap-4 max-w-7xl row-gap-10",
        className
      )}
    >
      {children}
    </div>
  );
};

export function BentoGridItem({className, children, customClass}: {className?: string, children: React.ReactNode, customClass: any}){

  return (
    <div
      style={customClass}
        className={cn(
          "group/bento transition duration-200",
        className
      )}
    >
      {children}
    </div>
  );
};
