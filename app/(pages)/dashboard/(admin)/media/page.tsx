"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import useSWR from "swr";
import { Search, Plus, Upload } from "lucide-react";
import { useLocale } from "next-intl";
import MediaLists from "@/app/components/(feature)/dashboard/admin/media/MediaLists";
import StatsCard from "@/app/components/ui/stats/StatsCard";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import EmptyState from "@/app/components/ui/error/EmptyState";
import MediaUploadModal from "@/app/components/(feature)/dashboard/admin/media/MediaUploadModal";

export default function MediaPage() {
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const {
    data: mediaLists,
    isLoading,
    error,
    mutate,
  } = useSWR([
    `/media/admin/get-media-lists?page=${currentPage}&size=10`,
    locale,
  ]);

  if (isLoading) {
    return (
      <LoadingSpinner
        message="正在加载媒体列表,请稍候..."
        size="md"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  if (error && error.status !== 404) {
    return (
      <ErrorDisplay
        title="加载媒体列表失败"
        message="加载媒体列表失败,请稍后重试"
        type="error"
      />
    );
  }

  // Handle case where mediaLists is undefined (e.g., 404 error or no data)
  // Use default values to maintain page layout
  const {
    items: mediaItems = [],
    pagination = { total_count: 0, new_items_this_month: 0 },
  } = mediaLists || {};

  // Stats data configuration
  const statsData = [
    {
      title: "媒体总数",
      value: pagination.total_count || 0,
      icon: Search,
      iconBgColor: "bg-primary-50",
      iconColor: "text-primary-500",
      delay: 0.1,
    },
    {
      title: "本月新增",
      value: pagination.new_items_this_month || 0,
      icon: Plus,
      iconBgColor: "bg-success-50",
      iconColor: "text-success-500",
      delay: 0.2,
    },
  ];

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header Section */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground-50 mb-1 sm:mb-2">
            媒体管理
          </h1>
          <p className="text-sm sm:text-base text-foreground-300">
            管理和查看所有媒体文件
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {statsData.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconBgColor={stat.iconBgColor}
              iconColor={stat.iconColor}
              delay={stat.delay}
            />
          ))}
          {/* Upload Button Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card-50 border border-border-50 rounded-sm p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-foreground-400 mb-1">
                  上传文件
                </p>
                <p className="text-xl sm:text-2xl font-bold text-primary-500">
                  点击上传
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-primary-50 rounded-sm shrink-0">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Media Lists Section */}
      {mediaItems && mediaItems.length > 0 ? (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card-50 border border-border-50 rounded-sm p-3 sm:p-4 lg:p-6"
          >
            <MediaLists
              mediaItems={mediaItems}
              pagination={pagination}
              setCurrentPage={setCurrentPage}
              onDataChange={() => {
                // Trigger data refresh using SWR mutate
                mutate();
              }}
            />
          </motion.div>
        </div>
      ) : (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <EmptyState
            icon={Upload}
            title="暂无媒体文件"
            description="目前还没有媒体文件，您可以点击上方的上传文件按钮开始上传"
            iconBgColor="bg-primary-50"
            iconColor="text-primary-500"
          />
        </div>
      )}

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          // Refresh the media list after successful upload
          mutate();
        }}
      />
    </div>
  );
}
