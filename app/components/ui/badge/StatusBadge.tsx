"use client";

type BadgeVariant = "success" | "error" | "warning" | "primary" | "default";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "xs" | "sm";
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-success-50 text-success-500",
  error: "bg-error-50 text-error-500",
  warning: "bg-warning-50 text-warning-500",
  primary: "bg-primary-50 text-primary-500",
  default: "bg-foreground-100 text-foreground-400",
};

const sizeStyles = {
  xs: "px-2 py-0.5 text-[10px]",
  sm: "px-2 py-1 text-xs",
};

const StatusBadge = ({ label, variant = "default", size = "sm" }: StatusBadgeProps) => {
  return (
    <span className={`${sizeStyles[size]} ${variantStyles[variant]} rounded-sm font-medium`}>
      {label}
    </span>
  );
};

export default StatusBadge;
