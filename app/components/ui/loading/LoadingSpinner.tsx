"use client";

import React from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "pulse" | "wave" | "dots" | "gradient";
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "md",
  variant = "default",
  className = "",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // 简约旋转加载器
  const DefaultSpinner = () => (
    <Loader2
      className={`${sizeClasses[size]} text-foreground-300 animate-spin`}
    />
  );

  // 简约脉冲加载器
  const PulseSpinner = () => (
    <div className="flex items-center justify-center space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-foreground-300 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  // 简约波浪加载器
  const WaveSpinner = () => (
    <div className="flex items-center justify-center space-x-1">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="w-1 bg-foreground-300 rounded-full"
          animate={{
            height: [8, 16, 8],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  // 简约点状加载器
  const DotsSpinner = () => (
    <div className="flex items-center justify-center space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-foreground-300 rounded-full"
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  // 简约渐变加载器
  const GradientSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} rounded-full border-2 border-foreground-200 border-t-foreground-400`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  const renderSpinner = () => {
    switch (variant) {
      case "pulse":
        return <PulseSpinner />;
      case "wave":
        return <WaveSpinner />;
      case "dots":
        return <DotsSpinner />;
      case "gradient":
        return <GradientSpinner />;
      default:
        return <DefaultSpinner />;
    }
  };

  const containerClasses = fullScreen
    ? `min-h-screen flex items-center justify-center ${className}`
    : `flex flex-col items-center justify-center ${className}`;

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {renderSpinner()}
        {message && (
          <p className={`text-foreground-300 ${textSizeClasses[size]} mt-3`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
