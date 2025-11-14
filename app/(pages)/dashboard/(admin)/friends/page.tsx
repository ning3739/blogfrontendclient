"use client";

import React, { useState } from "react";
import { FolderPlus, Globe } from "lucide-react";
import { motion } from "motion/react";
import useSWR from "swr";
import { useLocale } from "next-intl";
import FriendLists from "@/app/components/(feature)/dashboard/admin/friend/FriendLists";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import StatsCard from "@/app/components/ui/stats/StatsCard";
import EmptyState from "@/app/components/ui/error/EmptyState";

export default function FriendsPage() {
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: friendLists,
    isLoading,
    error,
    mutate,
  } = useSWR([
    `/friend/admin/get-friend-lists?page=${currentPage}&size=10`,
    locale,
  ]);

  if (isLoading) {
    return (
      <LoadingSpinner
        message="正在加载友链列表,请稍候..."
        size="md"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  if (error && error.status !== 404) {
    return (
      <ErrorDisplay
        title="加载友链列表失败"
        message="加载友链列表失败,请稍后重试"
        type="error"
      />
    );
  }

  // Handle case where friendLists is undefined (e.g., 404 error or no data)
  // Use default values to maintain page layout
  const {
    items: friendItems = [],
    pagination = { total_count: 0, new_items_this_month: 0 },
  } = friendLists || {};

  // Stats data configuration
  const statsData = [
    {
      title: "友链总数",
      value: pagination.total_count || 0,
      icon: Globe,
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
  ];

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header Section */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground-50 mb-1 sm:mb-2">
          友链管理
        </h1>
        <p className="text-sm sm:text-base text-foreground-300">
          管理和查看所有友链
        </p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {statsData.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value.toString()}
              icon={stat.icon}
              iconBgColor={stat.iconBgColor}
              iconColor={stat.iconColor}
              delay={stat.delay}
            />
          ))}
        </div>
      </div>

      {/* Friend Lists Table */}
      {friendItems && friendItems.length > 0 ? (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card-50 border border-border-50 rounded-sm p-3 sm:p-4 lg:p-6"
          >
            <FriendLists
              friendItems={friendItems}
              pagination={pagination}
              setCurrentPage={setCurrentPage}
              onDataChange={() => mutate()}
            />
          </motion.div>
        </div>
      ) : (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <EmptyState
            icon={Globe}
            title="暂无友链"
            description="目前还没有友链，您可以开始添加友链"
            iconBgColor="bg-primary-50"
            iconColor="text-primary-500"
          />
        </div>
      )}
    </div>
  );
}
