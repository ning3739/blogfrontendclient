"use client";

import { FolderOpen, FolderPlus } from "lucide-react";
import { motion } from "motion/react";
import { useLocale } from "next-intl";
import React from "react";
import useSWR from "swr";
import PostLists from "@/app/components/(feature)/dashboard/admin/posts/PostLists";
import { Button } from "@/app/components/ui/button/butten";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import StatsCard from "@/app/components/ui/stats/StatsCard";
import useSection from "@/app/hooks/useSection";
import type { SectionListItem } from "@/app/types/sectionServiceType";

export default function PostsPage() {
  const locale = useLocale();
  const { sections, isLoading: isSectionsLoading } = useSection();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedSectionId, setSelectedSectionId] = React.useState<SectionListItem | null>(null);

  const blogSectionLists = sections?.find(
    (section: SectionListItem) => section.type === "blog",
  )?.children;

  // 设置默认选中的 section
  React.useEffect(() => {
    if (blogSectionLists && blogSectionLists.length > 0 && !selectedSectionId) {
      setSelectedSectionId(blogSectionLists[0]);
    }
  }, [blogSectionLists, selectedSectionId]);

  const {
    data: blogLists,
    error,
    isLoading,
    mutate,
  } = useSWR(
    selectedSectionId?.section_id
      ? [
          `/blog/get-blog-lists?page=${currentPage}&size=5&section_id=${selectedSectionId.section_id}&published_only=false`,
          locale,
        ]
      : null,
  );

  if (isSectionsLoading) {
    return <LoadingSpinner message="加载板块中..." size="md" variant="wave" fullScreen={true} />;
  }

  if (isLoading) {
    return (
      <LoadingSpinner message="加载文章列表中..." size="md" variant="wave" fullScreen={true} />
    );
  }

  if (error && error.status !== 404) {
    return (
      <ErrorDisplay title="加载文章列表失败" message="加载文章列表失败,请稍后重试" type="error" />
    );
  }

  // Handle case where blogLists is undefined (e.g., 404 error or no data)
  // Use default values to maintain page layout
  const {
    items: blogItems = [],
    pagination = {
      total_count: 0,
      new_items_this_month: 0,
      updated_items_this_month: 0,
    },
  } = blogLists || {};

  // Stats data configuration
  const statsData = [
    {
      title: "总文章数",
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
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground-50 mb-1 sm:mb-2">文章管理</h1>
        <p className="text-sm sm:text-base text-foreground-300">管理和查看所有文章内容</p>
      </div>

      {/* Posts Stats */}
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

      {/* Section List */}
      {blogSectionLists && blogSectionLists.length > 0 && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {blogSectionLists.map((section: SectionListItem, index: number) => (
              <motion.div
                key={section.section_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="w-full"
              >
                <Button
                  onClick={() => setSelectedSectionId(section)}
                  variant={
                    selectedSectionId?.section_id === section.section_id ? "primary" : "outline"
                  }
                  size="sm"
                  className="w-full transition-colors justify-center"
                >
                  {section.title}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No sections message */}
      {blogSectionLists && blogSectionLists.length === 0 && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <EmptyState
            icon={FolderOpen}
            title="没有可用的博客板块"
            description="请先创建博客板块，然后才能管理文章"
            iconBgColor="bg-primary-50"
            iconColor="text-primary-500"
            variant="compact"
          />
        </div>
      )}

      {/* Blog Table */}
      {blogItems && blogItems.length > 0 ? (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card-50 border border-border-50 rounded-sm p-3 sm:p-4 lg:p-6"
          >
            <PostLists
              postItems={blogItems}
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
            title="暂无文章"
            description="当前板块还没有文章，您可以开始创建新文章"
            iconBgColor="bg-primary-50"
            iconColor="text-primary-500"
          />
        </div>
      )}
    </div>
  );
}
