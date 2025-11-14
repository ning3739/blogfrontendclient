"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import Image from "next/image";

interface ImagePreviewProps {
  isOpen: boolean;
  imageUrl: string;
  imageAlt?: string;
  onClose: () => void;
}

const ImagePreview = ({
  isOpen,
  imageUrl,
  imageAlt = "Preview",
  onClose,
}: ImagePreviewProps) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen]);

  // ESC 键关闭
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

  // 缩放控制
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  // 旋转控制
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // 重置所有变换
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 模态框内容 */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-card-50 border border-border-100 shadow-lg w-full h-full sm:w-[95vw] sm:h-[90vh] lg:w-[90vw] lg:h-[85vh] sm:max-w-6xl sm:rounded-sm overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部工具栏 */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 bg-card-100 border-b border-border-100 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
              {/* 左侧：图片信息 - 在移动端隐藏 */}
              <div className="hidden md:flex items-center gap-2 min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-foreground-50 truncate">
                  {imageAlt || "图片预览"}
                </h2>
              </div>

              {/* 中间：操作工具 */}
              <div className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-center md:justify-start md:flex-initial">
                <button
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="p-1.5 sm:p-2 rounded-sm bg-card-50 text-foreground-300 hover:bg-background-100 border border-border-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="缩小"
                  aria-label="缩小"
                >
                  <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className="text-xs sm:text-sm text-foreground-200 min-w-[45px] sm:min-w-[60px] text-center font-mono">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                  className="p-1.5 sm:p-2 rounded-sm bg-card-50 text-foreground-300 hover:bg-background-100 border border-border-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="放大"
                  aria-label="放大"
                >
                  <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="w-px h-4 sm:h-6 bg-border-100 mx-1 sm:mx-2" />
                <button
                  onClick={handleRotate}
                  className="p-1.5 sm:p-2 rounded-sm bg-card-50 text-foreground-300 hover:bg-background-100 border border-border-100 transition-colors"
                  title="旋转90°"
                  aria-label="旋转"
                >
                  <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="w-px h-4 sm:h-6 bg-border-100 mx-1 sm:mx-2" />
                <button
                  onClick={handleReset}
                  disabled={scale === 1 && rotation === 0}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-sm bg-card-50 text-foreground-300 hover:bg-background-100 border border-border-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="重置所有变换"
                  aria-label="重置"
                >
                  重置
                </button>
              </div>

              {/* 右侧：关闭按钮 */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-sm bg-card-50 text-foreground-300 hover:bg-error-50 hover:text-error-500 border border-border-100 flex-shrink-0"
                title="关闭 (ESC)"
                aria-label="关闭"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>

            {/* 图片显示区域 */}
            <div className="flex-1 overflow-auto bg-background-200 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                animate={{
                  scale: scale,
                  rotate: rotation,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center justify-center relative w-full h-full"
              >
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-contain rounded-sm select-none"
                  draggable={false}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 90vw"
                  quality={100}
                  priority
                />
              </motion.div>
            </div>

            {/* 底部提示栏 - 在移动端隐藏 */}
            <div className="hidden sm:flex items-center justify-center gap-4 bg-card-100 border-t border-border-100 px-6 py-3 flex-shrink-0">
              <span className="text-xs text-foreground-400">
                按{" "}
                <kbd className="px-1.5 py-0.5 bg-background-100 border border-border-100 rounded text-foreground-200 font-mono">
                  ESC
                </kbd>{" "}
                关闭，或点击图片外区域
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 使用 Portal 将模态框渲染到 body 下
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default ImagePreview;
