import { AudioWaveformIcon, FileIcon, Folder, Image as ImageIcon, Video } from "lucide-react";
import Image from "next/image";
import type { MediaItem } from "@/app/types/mediaServiceType";

interface MediaCardProps {
  media: MediaItem;
  onSelect?: (mediaId: number, url: string) => void;
}

// 媒体类型配置
const MEDIA_TYPE_CONFIG = {
  video: {
    icon: Video,
    hasThumbnail: true,
  },
  audio: {
    icon: AudioWaveformIcon,
    hasThumbnail: false,
  },
  image: {
    icon: ImageIcon,
    hasThumbnail: true,
  },
  document: {
    icon: FileIcon,
    hasThumbnail: false,
  },
  other: {
    icon: Folder,
    hasThumbnail: false,
  },
} as const;

export default function MediaCard({ media, onSelect }: MediaCardProps) {
  const handleClick = () => {
    if (onSelect && (media.watermark_filepath_url || media.original_filepath_url)) {
      onSelect(media.media_id, media.watermark_filepath_url || media.original_filepath_url);
    }
  };

  const handleVideoHover = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.play();
  };

  const handleVideoLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.pause();
    video.currentTime = 0;
  };

  // 渲染媒体预览内容
  const renderMediaPreview = () => {
    const config = MEDIA_TYPE_CONFIG[media.media_type as keyof typeof MEDIA_TYPE_CONFIG];

    if (!config) {
      return <div className="text-foreground-400 text-sm font-medium">无预览</div>;
    }

    const IconComponent = config.icon;

    // 视频类型特殊处理
    if (media.media_type === "video") {
      return media.thumbnail_filepath_url ? (
        <video
          src={media.thumbnail_filepath_url}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          muted
          loop
          onMouseEnter={handleVideoHover}
          onMouseLeave={handleVideoLeave}
        />
      ) : (
        <IconComponent className="w-12 h-12 text-primary-500" />
      );
    }

    // 图片类型特殊处理
    if (media.media_type === "image") {
      return media.thumbnail_filepath_url ? (
        <Image
          src={media.thumbnail_filepath_url}
          alt={`Media ${media.media_id}`}
          fill
          sizes="160px"
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
      ) : (
        <IconComponent className="w-12 h-12 text-primary-500" />
      );
    }

    // 其他类型统一使用图标
    return (
      <div className="flex items-center justify-center w-full h-full">
        <IconComponent className="w-12 h-12 text-primary-500" />
      </div>
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        relative rounded-sm overflow-hidden border bg-card-50 shadow-sm group w-full text-left
        ${
          onSelect
            ? "cursor-pointer border-border-100 hover:border-primary-500 hover:shadow-lg hover:scale-[1.02] transition-[border-color,box-shadow,transform] duration-200"
            : "border-border-100"
        }
      `}
    >
      <div className="w-full h-40 bg-card-100 flex items-center justify-center relative overflow-hidden">
        {renderMediaPreview()}
      </div>
      <div className="p-3 bg-card-50 border-t border-border-100">
        <p className="text-xs text-foreground-200 font-medium truncate">{media.file_name}</p>
        <p className="text-xs text-foreground-400 mt-1 capitalize">{media.media_type}</p>
      </div>
    </button>
  );
}
