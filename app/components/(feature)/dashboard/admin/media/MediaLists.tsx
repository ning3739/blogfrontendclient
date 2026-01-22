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
import StatusBadge from "@/app/components/ui/badge/StatusBadge";
import ActionButton from "@/app/components/ui/button/ActionButton";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import MediaService from "@/app/lib/services/mediaService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { OffsetPaginationResponse } from "@/app/types/commonType";
import type { MediaItem } from "@/app/types/mediaServiceType";

interface MediaListsProps {
  mediaItems: MediaItem[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void;
}

// 媒体类型配置
const MEDIA_TYPE_CONFIG = {
  video: { icon: Video, color: "text-red-500", bgColor: "bg-red-50", label: "视频" },
  audio: { icon: FileAudio, color: "text-blue-500", bgColor: "bg-blue-50", label: "音频" },
  image: { icon: ImageIcon, color: "text-green-500", bgColor: "bg-green-50", label: "图片" },
  document: { icon: FileText, color: "text-orange-500", bgColor: "bg-orange-50", label: "文档" },
  other: { icon: Folder, color: "text-gray-500", bgColor: "bg-gray-50", label: "其他" },
} as const;

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

// 媒体预览组件
const MediaThumbnail = ({ media }: { media: MediaItem }) => {
  const config = MEDIA_TYPE_CONFIG[media.media_type as keyof typeof MEDIA_TYPE_CONFIG];
  if (!config) return null;
  const IconComponent = config.icon;

  if (media.media_type === "video" && media.thumbnail_filepath_url) {
    return (
      <video src={media.thumbnail_filepath_url} className="w-full h-full object-cover" muted loop />
    );
  }
  if (media.media_type === "image" && media.thumbnail_filepath_url) {
    return (
      <Image
        src={media.thumbnail_filepath_url}
        alt={`Media ${media.media_id}`}
        fill
        sizes="80px"
        className="object-cover"
      />
    );
  }
  return (
    <div className={`w-full h-full ${config.bgColor} flex items-center justify-center`}>
      <IconComponent className={`w-8 h-8 ${config.color}`} />
    </div>
  );
};

// 媒体操作按钮组
const MediaActions = ({
  media,
  onPreview,
  onDownload,
  onDelete,
  showLabels = false,
}: {
  media: MediaItem;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  showLabels?: boolean;
}) => {
  const canPreview = media.media_type === "image" || media.media_type === "video";

  if (showLabels) {
    return (
      <>
        {canPreview && (
          <ActionButton icon={Eye} onClick={onPreview} title="预览" variant="info" label="预览" />
        )}
        <ActionButton
          icon={Download}
          onClick={onDownload}
          title="下载"
          variant="primary"
          label="下载"
        />
        <ActionButton icon={Trash2} onClick={onDelete} title="删除" variant="error" label="删除" />
      </>
    );
  }
  return (
    <>
      {canPreview && <ActionButton icon={Eye} onClick={onPreview} title="预览" variant="info" />}
      <ActionButton icon={Download} onClick={onDownload} title="下载" variant="primary" />
      <ActionButton icon={Trash2} onClick={onDelete} title="删除" variant="error" />
    </>
  );
};

const MediaLists = ({ mediaItems, pagination, setCurrentPage, onDataChange }: MediaListsProps) => {
  const _locale = useLocale();
  const format = useFormatter();
  const [optimisticMedia, setOptimisticMedia] = useState<MediaItem[]>(mediaItems);
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null);
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    setOptimisticMedia(mediaItems);
  }, [mediaItems]);

  const getMediaTypeLabel = (mediaType: string) => {
    return MEDIA_TYPE_CONFIG[mediaType as keyof typeof MEDIA_TYPE_CONFIG]?.label || mediaType;
  };

  const handlePreview = (media: MediaItem) => {
    const url = media.thumbnail_filepath_url || media.original_filepath_url;
    if (!url) return;
    if (media.media_type === "image") setPreviewImage({ url, alt: media.file_name });
    else if (media.media_type === "video") setPreviewVideo({ url, title: media.file_name });
  };

  const handleDownload = async (mediaId: number) => {
    try {
      await MediaService.downloadMedia({ media_id: mediaId });
    } catch (error) {
      console.error("Failed to download media:", error);
    }
  };

  const handleDelete = async (mediaId: number) => {
    setOptimisticMedia((prev) => prev.filter((m) => m.media_id !== mediaId));
    try {
      const response = await MediaService.deleteMedia({ media_ids: [mediaId] });
      if (response.status === 200) {
        toast.success("message" in response ? response.message : "Media deleted");
        onDataChange?.();
      } else {
        toast.error("error" in response ? response.error : "Failed to delete media");
        setOptimisticMedia(mediaItems);
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
      toast.error("Failed to delete media");
      setOptimisticMedia(mediaItems);
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-50">
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                媒体文件
              </th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-foreground-200">
                类型
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                大小
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                创建时间
              </th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-foreground-200">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {optimisticMedia.map((media, index) => (
              <motion.tr
                key={media.media_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0 relative">
                      <MediaThumbnail media={media} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground-50 truncate">
                        {media.file_name}
                      </p>
                      <p className="text-xs text-foreground-300 truncate">{media.media_uuid}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-center">
                    <StatusBadge label={getMediaTypeLabel(media.media_type)} variant="primary" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-foreground-200">{formatFileSize(media.file_size)}</p>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-foreground-200">
                    {handleDateFormat(media.created_at, format)}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-end space-x-2">
                    <MediaActions
                      media={media}
                      onPreview={() => handlePreview(media)}
                      onDownload={() => handleDownload(media.media_id)}
                      onDelete={() => handleDelete(media.media_id)}
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden space-y-3">
        {optimisticMedia.map((media, index) => (
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
                  <MediaThumbnail media={media} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground-50 truncate">
                    {media.file_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <StatusBadge
                      label={getMediaTypeLabel(media.media_type)}
                      variant="primary"
                      size="xs"
                    />
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
                <MediaActions
                  media={media}
                  onPreview={() => handlePreview(media)}
                  onDownload={() => handleDownload(media.media_id)}
                  onDelete={() => handleDelete(media.media_id)}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {optimisticMedia.map((media, index) => (
          <motion.div
            key={media.media_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0 relative">
                  <MediaThumbnail media={media} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground-50 truncate">
                    {media.file_name}
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={getMediaTypeLabel(media.media_type)}
                    variant="primary"
                    size="xs"
                  />
                  <span className="text-xs text-foreground-300">
                    {formatFileSize(media.file_size)}
                  </span>
                </div>
                <span className="text-xs text-foreground-300">
                  {handleDateFormat(media.created_at, format)}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <MediaActions
                  media={media}
                  onPreview={() => handlePreview(media)}
                  onDownload={() => handleDownload(media.media_id)}
                  onDelete={() => handleDelete(media.media_id)}
                  showLabels
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {optimisticMedia.length > 0 && (
        <div className="mt-6">
          <OffsetPagination pagination={pagination} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Preview Modals */}
      {previewImage && (
        <ImagePreview
          isOpen={!!previewImage}
          imageUrl={previewImage.url}
          imageAlt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
      )}
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
