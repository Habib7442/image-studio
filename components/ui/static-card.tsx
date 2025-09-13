"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const StaticCard = ({
  children,
  className,
  backgroundImage,
  ...props
}: {
  children: React.ReactNode;
  backgroundImage?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "group p-6 rounded-lg relative border border-border/20 bg-card/30 backdrop-blur-sm h-48 w-full overflow-hidden",
        className
      )}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      {...props}
    >
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 rounded-lg" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
        {children}
      </div>
    </div>
  );
};
