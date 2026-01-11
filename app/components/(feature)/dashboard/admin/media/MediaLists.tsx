"use client";

import {
  Download,
  Eye,
  FileAudio,
  FileText,
  Folder,
  Image as ImageIcon,
  Trash2,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useFormatter, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ImagePreview from "@/app/components/(feature)/content/ImagePreview";
import VideoPreview from "@/app/components/(feature)/dashboard/admin/media/VideoPreview";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import MediaService from "@/app/lib/services/mediaService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { OffsetPaginationResponse } from "@/app/types/commonType";
import type { MediaItem } from "@/app/types/mediaServiceType";

interface MediaListsProps {
  mediaItems: MediaItem[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void; // Optional callback for data refresh
}

// 媒体类型配置
const MEDIA_TYPE_CONFIG = {
  video: {
    icon: Video,
    hasThumbnail: true,
    color: "text-red-500",
    bgColor: "bg-red-50",
    label: "视频",
  },
  audio: {
    icon: FileAudio,
    hasThumbnail: false,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    label: "音频",
  },
  image: {
    icon: ImageIcon,
    hasThumbnail: true,
    color: "text-green-500",
    bgColor: "bg-green-50",
    label: "图片",
  },
  document: {
    icon: FileText,
    hasThumbnail: false,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    label: "文档",
  },
  other: {
    icon: Folder,
    hasThumbnail: false,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    label: "其他",
  },
} as const;

const MediaLists = ({ mediaItems, pagination, setCurrentPage, onDataChange }: MediaListsProps) => {
  const _locale = useLocale();
  const format = useFormatter();
  const [optimisticMedia, setOptimisticMedia] = useState<MediaItem[]>(mediaItems);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const [previewVideo, setPreviewVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // 获取媒体类型的中文标签
  const getMediaTypeLabel = (mediaType: string) => {
    const config = MEDIA_TYPE_CONFIG[mediaType as keyof typeof MEDIA_TYPE_CONFIG];
    return config?.label || mediaType;
  };

  // Update optimistic media when mediaItems prop changes
  useEffect(() => {
    setOptimisticMedia(mediaItems);
  }, [mediaItems]);

  const handleActionClick = async (action: string, mediaId: number) => {
    const media = optimisticMedia.find((m) => m.media_id === mediaId);

    if (!media) {
      console.error("Media not found:", mediaId);
      return;
    }

    if (action === "preview") {
      handleMediaPreview(media);
    } else if (action === "download") {
      try {
        await MediaService.downloadMedia({ media_id: mediaId });
      } catch (error) {
        console.error("Failed to download media:", error);
      }
    } else if (action === "delete") {
      try {
        // Optimistic update - immediately remove from UI
        setOptimisticMedia((prevMedia) => prevMedia.filter((m) => m.media_id !== mediaId));

        // Call API in background
        const response = await MediaService.deleteMedia({
          media_ids: [mediaId],
        });

        if (response.status === 200) {
          toast.success("message" in response ? response.message : "Media deleted");
          // Refresh list after successful deletion
          if (onDataChange) {
            onDataChange();
          }
        } else {
          toast.error("error" in response ? response.error : "Failed to delete media");
          setOptimisticMedia(mediaItems);
        }
      } catch (error) {
        // Rollback on error
        console.error("Failed to delete media:", error);
        toast.error("Failed to delete media");
        setOptimisticMedia(mediaItems);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const handleMediaPreview = (media: MediaItem) => {
    if (media.media_type === "image") {
      const imageUrl = media.thumbnail_filepath_url || media.original_filepath_url;
      if (imageUrl) {
        setPreviewImage({
          url: imageUrl,
          alt: media.file_name,
        });
      }
    } else if (media.media_type === "video") {
      const videoUrl = media.thumbnail_filepath_url || media.original_filepath_url;
      if (videoUrl) {
        setPreviewVideo({
          url: videoUrl,
          title: media.file_name,
        });
      }
    }
  };

  const renderMediaPreview = (media: MediaItem) => {
    const config = MEDIA_TYPE_CONFIG[media.media_type as keyof typeof MEDIA_TYPE_CONFIG];
    if (!config) return null;

    const IconComponent = config.icon;

    // 视频类型特殊处理
    if (media.media_type === "video") {
      return media.thumbnail_filepath_url ? (
        <video
          src={media.thumbnail_filepath_url}
          className="w-full h-full object-cover"
          muted
          loop
        />
      ) : (
        <div className={`w-full h-full ${config.bgColor} flex items-center justify-center`}>
          <IconComponent className={`w-8 h-8 ${config.color}`} />
        </div>
      );
    }

    // 图片类型特殊处理
    if (media.media_type === "image") {
      return media.thumbnail_filepath_url ? (
        <Image
          src={media.thumbnail_filepath_url}
          alt={`Media ${media.media_id}`}
          fill
          sizes="80px"
          className="object-cover"
        />
      ) : (
        <div className={`w-full h-full ${config.bgColor} flex items-center justify-center`}>
          <IconComponent className={`w-8 h-8 ${config.color}`} />
        </div>
      );
    }

    // 其他类型统一使用图标
    return (
      <div className={`w-full h-full ${config.bgColor} flex items-center justify-center`}>
        <IconComponent className={`w-8 h-8 ${config.color}`} />
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-50">
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  媒体文件
                </th>
                <th className="text-center py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  类型
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  大小
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  创建时间
                </th>
                <th className="text-right py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {optimisticMedia.map((media: MediaItem, index: number) => (
                <motion.tr
                  key={media.media_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                >
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0 relative">
                        {renderMediaPreview(media)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm font-medium text-foreground-50 truncate">
                          {media.file_name}
                        </p>
                        <p className="text-xs text-foreground-300 truncate">{media.media_uuid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex justify-center">
                      <span className="px-2 py-1 text-xs rounded-sm font-medium bg-primary-50 text-primary-500">
                        {getMediaTypeLabel(media.media_type)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <p className="text-xs lg:text-sm text-foreground-200">
                      {formatFileSize(media.file_size)}
                    </p>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <p className="text-xs lg:text-sm text-foreground-200">
                      {handleDateFormat(media.created_at, format)}
                    </p>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex justify-end space-x-1 lg:space-x-2">
                      {(media.media_type === "image" || media.media_type === "video") && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleActionClick("preview", media.media_id)}
                          className="p-1.5 lg:p-2 bg-blue-50 text-blue-500 rounded-sm hover:bg-blue-100 transition-colors"
                          title="预览"
                        >
                          <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("download", media.media_id)}
                        className="p-1.5 lg:p-2 bg-primary-50 text-primary-500 rounded-sm hover:bg-primary-100 transition-colors"
                        title="下载"
                      >
                        <Download className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("delete", media.media_id)}
                        className="p-1.5 lg:p-2 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        <div className="space-y-3">
          {optimisticMedia.map((media: MediaItem, index: number) => (
            <motion.div
              key={media.media_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0 relative">
                    {renderMediaPreview(media)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground-50 truncate">
                      {media.file_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 text-xs rounded-sm font-medium bg-primary-50 text-primary-500">
                        {getMediaTypeLabel(media.media_type)}
                      </span>
                      <span className="text-xs text-foreground-300">
                        {formatFileSize(media.file_size)}
                      </span>
                      <span className="text-xs text-foreground-300">
                        {handleDateFormat(media.created_at, format)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-1">
                  {(media.media_type === "image" || media.media_type === "video") && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActionClick("preview", media.media_id)}
                      className="p-1.5 bg-blue-50 text-blue-500 rounded-sm hover:bg-blue-100 transition-colors"
                      title="预览"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("download", media.media_id)}
                    className="p-1.5 bg-primary-50 text-primary-500 rounded-sm hover:bg-primary-100 transition-colors"
                    title="下载"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("delete", media.media_id)}
                    className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {optimisticMedia.map((media: MediaItem, index: number) => (
          <motion.div
            key={media.media_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="space-y-2.5">
              {/* Media Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0 relative">
                    {renderMediaPreview(media)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground-50 truncate">
                      {media.file_name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Media Meta */}
              <div className="space-y-2">
                {/* Type and Size Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] rounded-sm font-medium bg-primary-50 text-primary-500">
                      {getMediaTypeLabel(media.media_type)}
                    </span>
                    <span className="text-xs text-foreground-300">
                      {formatFileSize(media.file_size)}
                    </span>
                  </div>
                  <span className="text-xs text-foreground-300">
                    {handleDateFormat(media.created_at, format)}
                  </span>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-center space-x-1">
                  {/* Preview button - for images and videos */}
                  {(media.media_type === "image" || media.media_type === "video") && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActionClick("preview", media.media_id)}
                      className="px-3 py-1.5 rounded-sm transition-colors text-xs font-medium bg-blue-50 text-blue-500 hover:bg-blue-100"
                      title="预览"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      预览
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("download", media.media_id)}
                    className="px-3 py-1.5 rounded-sm transition-colors text-xs font-medium bg-primary-50 text-primary-500 hover:bg-primary-100"
                    title="下载"
                  >
                    <Download className="w-3 h-3 inline mr-1" />
                    下载
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("delete", media.media_id)}
                    className="px-3 py-1.5 rounded-sm transition-colors text-xs font-medium bg-error-50 text-error-400 hover:bg-error-100"
                    title="删除"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    删除
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {optimisticMedia.length > 0 && (
        <div className="mt-6">
          <OffsetPagination
            pagination={pagination}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreview
          isOpen={!!previewImage}
          imageUrl={previewImage.url}
          imageAlt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <VideoPreview
          isOpen={!!previewVideo}
          videoUrl={previewVideo.url}
          videoTitle={previewVideo.title}
          onClose={() => setPreviewVideo(null)}
        />
      )}
    </div>
  );
};

export default MediaLists;
