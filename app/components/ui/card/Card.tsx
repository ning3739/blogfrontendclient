import clsx from "clsx";
import { motion } from "motion/react";
import type React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "featured" | "minimal";
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  padding = "md",
  variant = "default",
  onClick,
}) => {
  const baseClasses = "transition-[box-shadow,transform,border-color] duration-300";

  const variantClasses = {
    default: "bg-card-100 rounded-sm border border-border-100 shadow-sm",
    featured: "bg-card-100 rounded-sm border border-border-100 shadow-lg",
    minimal: "bg-transparent border-b border-border-100 rounded-none shadow-none",
  };

  const paddingClasses = {
    sm: "p-3",
    md: "p-5",
    lg: "p-7",
  };

  const hoverClasses = hover ? "hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1" : "";

  const cardClasses = clsx(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    className,
  );

  if (onClick) {
    return (
      <motion.div
        className={cardClasses}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        whileHover={{ scale: hover ? 1.01 : 1, y: hover ? -4 : 0 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
