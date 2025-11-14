"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface VideoPreviewProps {
  isOpen: boolean;
  videoUrl: string;
  videoTitle?: string;
  onClose: () => void;
}

const VideoPreview = ({
  isOpen,
  videoUrl,
  videoTitle = "视频预览",
  onClose,
}: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // 关闭时暂停视频
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

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
              {/* 左侧：视频信息 */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-foreground-50 truncate">
                  {videoTitle}
                </h2>
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

            {/* 视频显示区域 */}
            <div className="flex-1 overflow-auto bg-background-200 flex items-center justify-center p-4 sm:p-6">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="max-w-full max-h-full rounded-sm w-full"
              >
                您的浏览器不支持视频播放。
              </video>
            </div>

            {/* 底部提示栏 - 在移动端隐藏 */}
            <div className="hidden sm:flex items-center justify-center gap-4 bg-card-100 border-t border-border-100 px-6 py-3 flex-shrink-0">
              <span className="text-xs text-foreground-400">
                按{" "}
                <kbd className="px-1.5 py-0.5 bg-background-100 border border-border-100 rounded text-foreground-200 font-mono">
                  ESC
                </kbd>{" "}
                关闭，或点击视频外区域
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

export default VideoPreview;
