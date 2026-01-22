"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

type ActionVariant = "primary" | "success" | "warning" | "error" | "info" | "default";

interface ActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  title: string;
  variant?: ActionVariant;
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

const variantStyles: Record<ActionVariant, string> = {
  primary: "bg-primary-50 text-primary-500 hover:bg-primary-100",
  success: "bg-success-50 text-success-400 hover:bg-success-100",
  warning: "bg-warning-50 text-warning-400 hover:bg-warning-100",
  error: "bg-error-50 text-error-400 hover:bg-error-100",
  info: "bg-blue-50 text-blue-500 hover:bg-blue-100",
  default: "bg-background-50 text-foreground-100 hover:bg-background-100",
};

const sizeStyles = {
  sm: "p-1.5",
  md: "p-1.5 lg:p-2",
};

const iconSizes = {
  sm: "w-3.5 h-3.5",
  md: "w-3.5 h-3.5 lg:w-4 lg:h-4",
};

const ActionButton = ({
  icon: Icon,
  onClick,
  title,
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  label,
}: ActionButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${sizeStyles[size]} ${variantStyles[variant]} rounded-sm transition-colors disabled:opacity-50 ${label ? "px-3 py-1.5 text-xs font-medium" : ""}`}
      title={title}
    >
      <Icon
        className={`${iconSizes[size]} ${loading ? "animate-spin" : ""} ${label ? "inline mr-1" : ""}`}
      />
      {label && label}
    </motion.button>
  );
};

export default ActionButton;
