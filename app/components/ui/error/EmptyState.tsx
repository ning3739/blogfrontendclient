"use client";

import React from "react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  iconSize?: string;
  iconBgSize?: string;
  iconColor?: string;
  iconBgColor?: string;
  variant?: "default" | "compact";
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  className = "",
  iconSize = "w-10 h-10",
  iconBgSize = "w-20 h-20",
  iconColor = "text-foreground-300",
  iconBgColor = "bg-background-50",
  variant = "default",
  children,
}) => {
  const paddingClass = variant === "compact" ? "py-12" : "py-20";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center ${paddingClass} bg-card-50 border border-border-50 rounded-sm ${className}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.4,
          delay: 0.1,
          type: "spring",
          stiffness: 200,
        }}
        className={`${iconBgSize} ${iconBgColor} rounded-full flex items-center justify-center mb-4`}
      >
        <Icon className={`${iconSize} ${iconColor}`} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-xl font-semibold text-foreground-50 mb-2"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-foreground-400 text-center"
        >
          {description}
        </motion.p>
      )}

      {children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-4"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
