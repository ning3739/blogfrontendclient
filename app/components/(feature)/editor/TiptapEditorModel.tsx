"use client";

import { useState } from "react";
import useSWR from "swr";
import MediaCard from "@/app/components/(feature)/editor/MediaCard";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import Modal from "@/app/components/ui/modal/Modal";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import type { MediaItem } from "@/app/types/mediaServiceType";
import { MediaTypeEnum } from "@/app/types/mediaServiceType";

interface TiptapEditorModelProps {
  type: MediaTypeEnum;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (mediaId: number, url: string) => void;
}

export default function TiptapEditorModel({
  type,
  isOpen,
  onClose,
  onSelect,
}: TiptapEditorModelProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 只有当 modal 打开时才发起请求，避免不必要的 404 错误
  const {
    data: mediaLists,
    error,
    isLoading,
  } = useSWR(
    isOpen ? `media/admin/get-media-lists?page=${currentPage}&size=4&media_type=${type}` : null,
  );

  const handleSelect = (mediaId: number, url: string) => {
    if (onSelect) {
      onSelect(mediaId, url);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`选择 ${MediaTypeEnum[type].toString()} 文件`}
      size="xl"
      maxHeight="max-h-[90vh]"
    >
      <div className="space-y-6">
        {error && <ErrorDisplay message="加载媒体列表失败" type="error" />}

        {isLoading && (
          <LoadingSpinner
            message="正在加载媒体列表..."
            size="md"
            variant="wave"
            fullScreen={true}
          />
        )}

        {!isLoading &&
          !error &&
          mediaLists?.items &&
          (() => {
            const { items: mediaItems, pagination } = mediaLists;
            const filterMediaItems = mediaItems.filter(
              (item: MediaItem) => item.media_type === MediaTypeEnum[type],
            );

            if (filterMediaItems.length === 0) {
              return (
                <div className="text-center py-16 px-4 bg-card-100 rounded-sm border-2 border-dashed border-border-100">
                  <div className="max-w-md mx-auto">
                    <p className="text-foreground-200 text-lg font-medium mb-2">
                      没有找到 {type} 类型的媒体文件
                    </p>
                    <p className="text-foreground-400 text-sm">请先上传一些 {type} 文件</p>
                  </div>
                </div>
              );
            }

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {filterMediaItems.map((item: MediaItem) => (
                    <MediaCard key={item.media_id} media={item} onSelect={handleSelect} />
                  ))}
                </div>
                <OffsetPagination pagination={pagination} onPageChange={setCurrentPage} />
              </>
            );
          })()}
      </div>
    </Modal>
  );
}
