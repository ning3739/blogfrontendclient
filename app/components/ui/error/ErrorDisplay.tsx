"use client";

import React from "react";
import { motion } from "motion/react";
import { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  type?: "error" | "warning" | "notFound";
  showReload?: boolean;
  onReload?: () => void;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  type = "error",
  showReload = true,
  onReload,
  className = "",
}) => {
  const getIconAndColors = () => {
    switch (type) {
      case "error":
        return {
          icon: AlertCircle,
          iconColor: "text-error-500",
          titleColor: "text-foreground-50",
          messageColor: "text-foreground-300",
          buttonColor: "bg-error-500 hover:bg-error-600",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-warning-500",
          titleColor: "text-foreground-50",
          messageColor: "text-foreground-300",
          buttonColor: "bg-warning-600 hover:bg-warning-700",
        };
      case "notFound":
        return {
          icon: AlertTriangle,
          iconColor: "text-warning-500",
          titleColor: "text-foreground-50",
          messageColor: "text-foreground-300",
          buttonColor: "bg-primary-500 hover:bg-primary-600",
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: "text-error-500",
          titleColor: "text-foreground-50",
          messageColor: "text-foreground-300",
          buttonColor: "bg-error-500 hover:bg-error-600",
        };
    }
  };

  const {
    icon: Icon,
    iconColor,
    titleColor,
    messageColor,
    buttonColor,
  } = getIconAndColors();

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  return (
    <motion.div
      className={`min-h-screen my-16 max-w-4xl mx-auto px-6 py-12 bg-background-100 border border-border-100 rounded-sm flex items-center justify-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            type: "spring",
            stiffness: 200,
          }}
        >
          <Icon className={`h-12 w-12 ${iconColor} mx-auto mb-4`} />
        </motion.div>

        <motion.h2
          className={`text-xl font-medium ${titleColor} mb-2`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {title}
        </motion.h2>

        <motion.p
          className={`${messageColor} mb-4`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          {message}
        </motion.p>

        {showReload && (
          <motion.button
            onClick={handleReload}
            className={`px-4 py-2 ${buttonColor} text-white rounded-sm transition-colors flex items-center gap-2 mx-auto`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-4 h-4" />
            重新加载
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ErrorDisplay;
