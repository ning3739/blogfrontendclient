"use client";

import { Loader2 } from "lucide-react";
import type { TargetAndTransition } from "motion/react";
import { motion } from "motion/react";
import type React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "pulse" | "wave" | "dots" | "gradient";
  className?: string;
  fullScreen?: boolean;
}

const SIZE_MAP = {
  sm: { icon: "h-4 w-4", text: "text-sm" },
  md: { icon: "h-8 w-8", text: "text-base" },
  lg: { icon: "h-12 w-12", text: "text-lg" },
} as const;

const AnimatedDots = ({ count, animate }: { count: number; animate: TargetAndTransition }) => (
  <div className="flex items-center justify-center space-x-1">
    {Array.from({ length: count }, (_, i) => (
      <motion.div
        // biome-ignore lint/suspicious/noArrayIndexKey: Static list of dots, order never changes
        key={i}
        className="w-2 h-2 bg-foreground-300 rounded-full"
        animate={animate}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "md",
  variant = "default",
  className = "",
  fullScreen = false,
}) => {
  const { icon: iconSize, text: textSize } = SIZE_MAP[size];

  const renderSpinner = () => {
    switch (variant) {
      case "pulse":
        return <AnimatedDots count={3} animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} />;
      case "dots":
        return <AnimatedDots count={3} animate={{ y: [0, -6, 0] }} />;
      case "wave":
        return (
          <div className="flex items-center justify-center space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-foreground-300 rounded-full"
                animate={{ height: [8, 16, 8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </div>
        );
      case "gradient":
        return (
          <motion.div
            className={`${iconSize} rounded-full border-2 border-foreground-200 border-t-foreground-400`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        );
      default:
        return <Loader2 className={`${iconSize} text-foreground-300 animate-spin`} />;
    }
  };

  return (
    <div
      className={
        fullScreen
          ? `min-h-screen flex items-center justify-center ${className}`
          : `flex flex-col items-center justify-center ${className}`
      }
    >
      <div className="text-center">
        {renderSpinner()}
        {message && <p className={`text-foreground-300 ${textSize} mt-3`}>{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
