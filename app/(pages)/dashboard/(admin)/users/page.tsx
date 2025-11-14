"use client";

import React, { useState } from "react";
import { Users, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import useSWR from "swr";
import { useLocale } from "next-intl";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import EmptyState from "@/app/components/ui/error/EmptyState";
import UserLists from "@/app/components/(feature)/dashboard/admin/users/UserLists";
import StatsCard from "@/app/components/ui/stats/StatsCard";

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const locale = useLocale();
  const {
    data: userLists,
    isLoading,
    error,
    mutate,
  } = useSWR([
    `/user/admin/get-user-lists?page=${currentPage}&size=10`,
    locale,
  ]);

  if (isLoading) {
    return (
      <LoadingSpinner
        message="正在加载用户列表,请稍候..."
        size="md"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  if (error && error.status !== 404) {
    return (
      <ErrorDisplay
        title="加载用户列表失败"
        message="加载用户列表失败,请稍后重试"
        type="error"
      />
    );
  }

  // Handle case where userLists is undefined (e.g., 404 error or no data)
  // Use default values to maintain page layout
  const {
    items: userItems = [],
    pagination = {
      total_count: 0,
      new_items_this_month: 0,
      active_users: 0,
    },
  } = userLists || {};

  // Stats data configuration
  const statsData = [
    {
      title: "用户总数",
      value: pagination.total_count || 0,
      icon: Users,
      iconBgColor: "bg-primary-50",
      iconColor: "text-primary-500",
      delay: 0.1,
    },
    {
      title: "本月新增",
      value: pagination.new_items_this_month || 0,
      icon: UserPlus,
      iconBgColor: "bg-success-50",
      iconColor: "text-success-500",
      delay: 0.2,
    },
    {
      title: "活跃用户",
      value: pagination.active_users || 0,
      icon: Users,
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
          用户管理
        </h1>
        <p className="text-sm sm:text-base text-foreground-300">
          管理用户账户和权限设置。
        </p>
      </div>

      {/* User Stats */}
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

      {/* User Table */}
      {userItems && userItems.length > 0 ? (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card-50 border border-border-50 rounded-sm p-3 sm:p-4 lg:p-6"
          >
            <UserLists
              userItems={userItems}
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
            icon={Users}
            title="暂无用户"
            description="目前还没有用户，您可以开始添加新用户"
            iconBgColor="bg-primary-50"
            iconColor="text-primary-500"
          />
        </div>
      )}
    </div>
  );
}
