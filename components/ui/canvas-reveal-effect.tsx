"use client";

import { cn } from "@/lib/utils";
import { useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

export const CanvasRevealEffect = ({
  animationSpeed = 0.3,
  containerClassName,
  colors,
  dotSize,
}: {
  animationSpeed?: number;
  containerClassName?: string;
  colors: number[][];
  dotSize?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useAnimationFrame((currentTime) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const time = currentTime * animationSpeed;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          radius
        );

        colors.forEach((color, index) => {
          const offset = (index / (colors.length - 1)) * 0.5;
          gradient.addColorStop(offset, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.1)`);
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add some animated dots
        for (let i = 0; i < 20; i++) {
          const angle = (time * 0.001 + i * 0.3) % (Math.PI * 2);
          const x = centerX + Math.cos(angle) * (radius * 0.7);
          const y = centerY + Math.sin(angle) * (radius * 0.7);
          
          ctx.beginPath();
          ctx.arc(x, y, dotSize || 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colors[0][0]}, ${colors[0][1]}, ${colors[0][2]}, 0.6)`;
          ctx.fill();
        }
      }
    }
  });

  return (
    <div className={cn("relative", containerClassName)}>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-full"
        onMouseEnter={() => setIsAnimating(true)}
        onMouseLeave={() => setIsAnimating(false)}
      />
    </div>
  );
};