"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  FileAudio,
  Folder,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import MediaService from "@/app/lib/services/mediaService";
import { Button } from "@/app/components/ui/button/butten";
import Modal from "@/app/components/ui/modal/Modal";

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

const MediaUploadModal = ({
  isOpen,
  onClose,
  onUploadSuccess,
}: MediaUploadModalProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return ImageIcon;
    if (type.startsWith("video/")) return Video;
    if (type.startsWith("audio/")) return FileAudio;
    if (type.includes("pdf") || type.includes("document")) return FileText;
    return Folder;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadFile[] = Array.from(fileList).map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = e.dataTransfer.files;
      handleFiles(droppedFiles);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles) {
        handleFiles(selectedFiles);
      }
    },
    [handleFiles]
  );

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const filesToUpload = files.filter((f) => f.status === "pending");

    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          filesToUpload.some((ftu) => ftu.id === f.id)
            ? { ...f, status: "uploading" as const, progress: 0 }
            : f
        )
      );

      // Upload files with progress tracking
      const response = await MediaService.uploadMedia(
        {
          files: filesToUpload.map((f) => f.file),
        },
        (progressEvent) => {
          // Calculate overall progress
          const totalSize = filesToUpload.reduce(
            (sum, f) => sum + f.file.size,
            0
          );
          const uploadedSize = progressEvent.loaded || 0;
          const progress = Math.round((uploadedSize / totalSize) * 100);

          // Update progress for all uploading files
          setFiles((prev) =>
            prev.map((f) =>
              filesToUpload.some((ftu) => ftu.id === f.id) &&
              f.status === "uploading"
                ? { ...f, progress }
                : f
            )
          );
        }
      );

      if ("message" in response) {
        // SuccessResponse
        // Update status to success
        setFiles((prev) =>
          prev.map((f) =>
            filesToUpload.some((ftu) => ftu.id === f.id)
              ? { ...f, status: "success" as const, progress: 100 }
              : f
          )
        );

        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess();
        }

        // Clear the file list and close modal immediately
        setFiles([]);
        onClose();
      } else {
        // ErrorResponse
        throw new Error(response.error || "Upload failed");
      }
    } catch (error) {
      // Update status to error
      setFiles((prev) =>
        prev.map((f) =>
          filesToUpload.some((ftu) => ftu.id === f.id)
            ? {
                ...f,
                status: "error" as const,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setFiles([]);
    setIsUploading(false);
    setIsDragOver(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const hasPendingFiles = files.some((f) => f.status === "pending");
  const hasErrorFiles = files.some((f) => f.status === "error");

  const modalFooter = (
    <>
      <Button onClick={handleClose} variant="outline" disabled={isUploading}>
        取消
      </Button>
      <Button
        onClick={uploadFiles}
        variant="primary"
        disabled={!hasPendingFiles || isUploading}
        className="flex items-center space-x-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>上传中...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>上传文件</span>
          </>
        )}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="上传媒体文件"
      footer={modalFooter}
      size="lg"
      maxHeight="max-h-[80vh]"
    >
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors ${
          isDragOver
            ? "border-primary-500 bg-primary-50"
            : "border-border-200 hover:border-border-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-foreground-300 mx-auto mb-4" />
        <p className="text-foreground-200 mb-2">拖拽文件到此处或点击选择文件</p>
        <p className="text-sm text-foreground-300 mb-4">
          支持图片、视频、音频、文档等格式
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          disabled={isUploading}
        >
          选择文件
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-foreground-200 mb-3">
            文件列表 ({files.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((fileItem) => {
              const IconComponent = getFileIcon(fileItem.file);
              return (
                <motion.div
                  key={fileItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-background-50 rounded-sm border border-border-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-foreground-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground-50 truncate">
                          {fileItem.file.name}
                        </p>
                        <p className="text-xs text-foreground-300">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Status Icon */}
                      {fileItem.status === "pending" && (
                        <div className="w-5 h-5 rounded-full border-2 border-border-200" />
                      )}
                      {fileItem.status === "uploading" && (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                          <span className="text-xs text-foreground-300">
                            {fileItem.progress}%
                          </span>
                        </div>
                      )}
                      {fileItem.status === "success" && (
                        <CheckCircle className="w-5 h-5 text-success-500" />
                      )}
                      {fileItem.status === "error" && (
                        <AlertCircle className="w-5 h-5 text-error-500" />
                      )}

                      {/* Remove Button */}
                      {fileItem.status !== "uploading" && (
                        <button
                          onClick={() => removeFile(fileItem.id)}
                          className="text-foreground-300 hover:text-error-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {fileItem.status === "uploading" && (
                    <div className="mt-2">
                      <div className="w-full bg-border-100 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {hasErrorFiles && (
        <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-sm">
          <p className="text-sm text-error-600">
            部分文件上传失败，请检查文件格式和大小
          </p>
        </div>
      )}
    </Modal>
  );
};

export default MediaUploadModal;
