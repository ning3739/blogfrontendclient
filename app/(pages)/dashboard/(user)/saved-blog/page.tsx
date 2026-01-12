"use client";

import { Bookmark, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import useSWR from "swr";
import SavedBlogLists from "@/app/components/(feature)/dashboard/user/saved-blog/SavedBlogLists";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import StatsCard from "@/app/components/ui/stats/StatsCard";
import { useAuth } from "@/app/hooks/useAuth";

export default function SavedBlogPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const locale = useLocale();
  const dashboardT = useTranslations("dashboard.mySaved");
  const commonT = useTranslations("common");
  const userId = user?.user_id;

  const {
    data: savedBlogLists,
    isLoading,
    error,
    mutate,
  } = useSWR(
    // 只有当 userId 存在时才发起请求
    userId
      ? [`/blog/get-saved-blog-lists?user_id=${userId}&page=${currentPage}&size=10`, locale]
      : null,
  );

  // 如果用户数据还未加载或正在加载收藏列表，显示加载状态
  if (!userId || isLoading) {
    return (
      <LoadingSpinner message={commonT("loading")} size="md" variant="wave" fullScreen={true} />
    );
  }

  if (error && error.status !== 404) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
      />
    );
  }

  // Handle case where savedBlogLists is undefined (404 or no data)
  // The API returns a tuple: [items, pagination_metadata]
  const hasData = savedBlogLists && Array.isArray(savedBlogLists) && savedBlogLists.length === 2;

  // Default values for empty state
  const [savedBlogItems, pagination] = hasData
    ? savedBlogLists
    : [[], { total_count: 0, new_items_this_month: 0 }];

  // Stats data configuration
  const statsData = [
    {
      title: dashboardT("total"),
      value: pagination?.total_count || 0,
      icon: Bookmark,
      iconBgColor: "bg-primary-50",
      iconColor: "text-primary-500",
      delay: 0.1,
    },
    {
      title: dashboardT("newItemsThisMonth"),
      value: pagination?.new_items_this_month || 0,
      icon: Calendar,
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
          {dashboardT("title")}
        </h1>
        <p className="text-sm sm:text-base text-foreground-300">{dashboardT("description")}</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
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

      {/* Saved Blogs Table */}
      {savedBlogItems && savedBlogItems.length > 0 ? (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card-50 border border-border-50 rounded-sm p-3 sm:p-4 lg:p-6"
          >
            <SavedBlogLists
              savedBlogItems={savedBlogItems}
              pagination={pagination}
              setCurrentPage={setCurrentPage}
              onDataChange={() => mutate()}
            />
          </motion.div>
        </div>
      ) : (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <EmptyState
            icon={Bookmark}
            title={dashboardT("noSaved")}
            description={dashboardT("noSavedDescription")}
          />
        </div>
      )}
    </div>
  );
}
