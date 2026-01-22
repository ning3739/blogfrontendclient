"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  round?: "sm" | "md" | "lg" | "none";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  maxHeight?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  footer,
  round = "sm",
  size = "md",
  closeOnOverlayClick = true,
  maxHeight = "max-h-[70vh]",
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const roundClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    none: "rounded-none",
  };

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 背景遮罩 */}
      <motion.div
        className="absolute inset-0 bg-black backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* 模态框内容 */}
      <motion.div
        className={clsx(
          "relative bg-card-50 border border-border-100 shadow-lg w-full",
          roundClasses[round],
          sizeClasses[size],
        )}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border-100 bg-card-100">
            <h2 className="text-xl font-semibold text-foreground-50">{title}</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-sm bg-card-50 text-foreground-300 hover:bg-error-50 hover:text-error-500 border border-border-100"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        )}

        {/* 内容区域 */}
        <div className={clsx("p-6 overflow-y-auto", maxHeight)}>{children}</div>

        {/* 底部区域 */}
        {footer && (
          <div className="flex justify-end space-x-3 p-6 border-t border-border-100 bg-card-100">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
};

export default BaseModal;
