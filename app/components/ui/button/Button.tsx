import clsx from "clsx";
import type React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "static";

type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  gradient?: boolean;
  fullWidth?: boolean;
}

// 基础样式 - 所有按钮共享
const baseClasses =
  "inline-flex items-center justify-center rounded-sm font-semibold transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-0.5 active:translate-y-0";

// 静态样式 - 没有动画的按钮
const staticBaseClasses =
  "inline-flex items-center justify-center rounded-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-md hover:shadow-lg",
  secondary:
    "bg-card-100 text-foreground-50 border border-border-100 hover:bg-background-300 focus:ring-border-200 shadow-sm hover:shadow-md",
  ghost:
    "bg-transparent text-foreground-200 hover:bg-background-300 hover:text-foreground-50 focus:ring-primary-500",
  outline:
    "border-2 border-border-100 text-foreground-50 hover:bg-card-100 hover:border-border-200 focus:ring-primary-500",
  static: "bg-background-50 border border-border-100 text-foreground-50 focus:ring-primary-500",
};

const gradientClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg",
  secondary:
    "bg-linear-to-r from-card-100 to-card-200 text-foreground-50 border border-border-100 hover:from-background-300 hover:to-background-300 focus:ring-border-200 shadow-sm hover:shadow-md",
  ghost:
    "text-foreground-200 hover:bg-background-300 hover:text-foreground-50 focus:ring-primary-500",
  outline:
    "border-2 border-border-100 text-foreground-50 hover:bg-card-100 hover:border-border-200 focus:ring-primary-500",
  static: "bg-background-50 border border-border-100 text-foreground-50 focus:ring-primary-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-3.5 text-xl",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  gradient = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={clsx(
        variant === "static" ? staticBaseClasses : baseClasses,
        gradient ? gradientClasses[variant] : variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        isDisabled && "opacity-50 cursor-not-allowed hover:transform-none",
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </button>
  );
};
