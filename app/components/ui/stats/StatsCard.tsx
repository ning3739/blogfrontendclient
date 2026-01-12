"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  delay?: number;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = "bg-primary-50",
  iconColor = "text-primary-500",
  delay = 0,
  className = "",
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-card-50 border border-border-50 rounded-sm p-5 sm:p-6 hover:shadow-lg hover:border-border-100 transition-[box-shadow,border-color] duration-300 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-foreground-400 mb-2 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground-50 truncate">{value}</p>
          {subtitle && <p className="text-xs text-foreground-300 mt-2 line-clamp-2">{subtitle}</p>}
        </div>
        <div className={`p-3 sm:p-4 ${iconBgColor} rounded-sm shrink-0 shadow-sm`}>
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
}
