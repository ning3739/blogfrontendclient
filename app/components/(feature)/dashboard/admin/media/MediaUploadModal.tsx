"use client";

import {
  AlertCircle,
  CheckCircle,
  FileAudio,
  FileText,
  Folder,
  Image as ImageIcon,
  Loader2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/app/components/ui/button/Button";
import BaseModal from "@/app/components/ui/modal/BaseModal";
import MediaService from "@/app/lib/services/mediaService";

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

const MediaUploadModal = ({ isOpen, onClose, onUploadSuccess }: MediaUploadModalProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const name = file.name.toLowerCase();
    const extension = name.split(".").pop() || "";

    // 图片格式：jpg, jpeg, png, gif
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return ImageIcon;
    }

    // 视频格式：mp4, avi, mov, mkv
    if (["mp4", "avi", "mov", "mkv"].includes(extension)) {
      return Video;
    }

    // 音频格式：mp3, wav, aac
    if (["mp3", "wav", "aac"].includes(extension)) {
      return FileAudio;
    }

    // 文档格式：pdf, docx, xlsx, ppt, pptx, txt
    if (["pdf", "docx", "xlsx", "ppt", "pptx", "txt"].includes(extension)) {
      return FileText;
    }

    // 其他格式：zip, gz
    if (["zip", "gz"].includes(extension)) {
      return Folder;
    }

    return Folder;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  // 最大单文件大小：100MB
  const MAX_FILE_SIZE = 100 * 1024 * 1024;

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).reduce<UploadFile[]>((acc, file) => {
      if (file.size > MAX_FILE_SIZE) {
        // 超过 100MB 的文件，显示提示
        toast.error(`${file.name} 超过 100MB 限制，已忽略`);
        return acc;
      }

      acc.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: "pending",
        progress: 0,
      });

      return acc;
    }, []);

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
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
    [handleFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles) {
        handleFiles(selectedFiles);
      }
    },
    [handleFiles],
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
            : f,
        ),
      );

      // Upload files with progress tracking
      const response = await MediaService.uploadMedia(
        {
          files: filesToUpload.map((f) => f.file),
        },
        (progressEvent) => {
          // Calculate overall progress
          const totalSize = filesToUpload.reduce((sum, f) => sum + f.file.size, 0);
          const uploadedSize = progressEvent.loaded || 0;
          const progress = Math.round((uploadedSize / totalSize) * 100);

          // Update progress for all uploading files
          setFiles((prev) =>
            prev.map((f) =>
              filesToUpload.some((ftu) => ftu.id === f.id) && f.status === "uploading"
                ? { ...f, progress }
                : f,
            ),
          );
        },
      );

      if (response.status === 200 && "message" in response) {
        // SuccessResponse
        toast.success(response.message);
        // Update status to success
        setFiles((prev) =>
          prev.map((f) =>
            filesToUpload.some((ftu) => ftu.id === f.id)
              ? { ...f, status: "success" as const, progress: 100 }
              : f,
          ),
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
        const errorMsg = "error" in response ? response.error : "Upload failed";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed";
      toast.error(errorMsg);
      // Update status to error
      setFiles((prev) =>
        prev.map((f) =>
          filesToUpload.some((ftu) => ftu.id === f.id)
            ? {
                ...f,
                status: "error" as const,
                error: errorMsg,
              }
            : f,
        ),
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
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="上传媒体文件"
      footer={modalFooter}
      size="lg"
      maxHeight="max-h-[80vh]"
    >
      {/* Upload Area */}
      <button
        type="button"
        className={`w-full border-2 border-dashed rounded-sm p-8 text-center transition-colors bg-transparent ${
          isDragOver
            ? "border-primary-500 bg-primary-50"
            : "border-border-200 hover:border-border-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-foreground-300 mx-auto mb-4" />
        <p className="text-foreground-200 mb-3">拖拽文件到此处或点击选择文件</p>
        <div className="mb-3 max-w-xl mx-auto">
          <div className="rounded-sm border border-border-100 bg-background-50/60 px-3 py-2.5 text-left">
            <p className="text-xs font-medium text-foreground-300 mb-2">支持的文件类型</p>
            <div className="space-y-1.5 text-xs text-foreground-300">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                  <ImageIcon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">
                  图片：
                  <span className="text-foreground-200">jpg / jpeg / png / gif</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                  <Video className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">
                  视频：
                  <span className="text-foreground-200">mp4 / avi / mov / mkv</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <FileAudio className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">
                  音频：
                  <span className="text-foreground-200">mp3 / wav / aac</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                  <FileText className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">
                  文档：
                  <span className="text-foreground-200">pdf / docx / xlsx / ppt / pptx / txt</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Folder className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">
                  压缩包：<span className="text-foreground-200">zip / gz</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-foreground-300 mb-4">单个文件最大 80MB，超出将无法上传</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mkv,.mp3,.wav,.aac,.pdf,.docx,.xlsx,.ppt,.pptx,.txt,.zip,.gz"
        />
      </button>

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
                      <div className="shrink-0">
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
                          <span className="text-xs text-foreground-300">{fileItem.progress}%</span>
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
                          type="button"
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
                          className="bg-primary-500 h-2 rounded-full transition-[width] duration-300"
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
          <p className="text-sm text-error-600">部分文件上传失败，请检查文件格式和大小</p>
        </div>
      )}
    </BaseModal>
  );
};

export default MediaUploadModal;
