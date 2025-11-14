"use client";

import React, { useState } from "react";
import { FolderOpen, FolderPlus } from "lucide-react";
import { motion } from "motion/react";
import useSWR from "swr";
import { useLocale } from "next-intl";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ProjectLists from "@/app/components/(feature)/dashboard/admin/projects/ProjectLists";
import StatsCard from "@/app/components/ui/stats/StatsCard";

export default function ProjectsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const locale = useLocale();
  const {
    data: projectLists,
    isLoading,
    error,
    mutate,
  } = useSWR([
    `/project/get-project-lists?page=${currentPage}&size=5&published_only=false`,
    locale,
  ]);

  if (isLoading) {
    return (
      <LoadingSpinner
        message="正在加载项目列表,请稍候..."
        size="md"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  if (error && error.status !== 404) {
    return (
      <ErrorDisplay
        title="加载项目列表失败"
        message="加载项目列表失败,请稍后重试"
        type="error"
      />
    );
  }

  // Handle case where projectLists is undefined (e.g., 404 error or no data)
  // Use default values to maintain page layout
  const {
    items: projectItems = [],
    pagination = {
      total_count: 0,
      new_items_this_month: 0,
      updated_items_this_month: 0,
    },
  } = projectLists || {};

  // Stats data configuration
  const statsData = [
    {
      title: "项目总数",
      value: pagination.total_count || 0,
      icon: FolderOpen,
      iconBgColor: "bg-primary-50",
      iconColor: "text-primary-500",
      delay: 0.1,
    },
    {
      title: "本月新增",
      value: pagination.new_items_this_month || 0,
      icon: FolderPlus,
      iconBgColor: "bg-success-50",
      iconColor: "text-success-500",
      delay: 0.2,
    },
    {
      title: "本月更新",
      value: pagination.updated_items_this_month || 0,
      icon: FolderOpen,
      iconBgColor: "bg-info-50",
      iconColor: "text-info-500",
      delay: 0.3,
    },
  ];

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header Section */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground-50 mb-1 sm:mb-2">
          项目管理
        </h1>
        <p className="text-sm sm:text-base text-foreground-300">
          管理和组织您的项目作品。
        </p>
      </div>

      {/* Project Stats */}
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
        </div>
      </div>

      {/* Project Table */}
      {projectItems && projectItems.length > 0 ? (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card-50 border border-border-50 rounded-sm p-3 sm:p-4 lg:p-6"
          >
            <ProjectLists
              projectItems={projectItems}
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
            icon={FolderOpen}
            title="暂无项目"
            description="目前还没有项目，您可以开始创建新项目"
            iconBgColor="bg-primary-50"
            iconColor="text-primary-500"
          />
        </div>
      )}
    </div>
  );
}
