import React from "react";
import { useRouter } from "next/navigation";
import type { TagStatistic } from "@/app/types/analyticServiceType";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import { Button } from "@/app/components/ui/button/butten";

interface TagCloudProps {
  tags?: TagStatistic[];
  isLoading?: boolean;
  error?: unknown;
}

export default function TagCloud({ tags, isLoading, error }: TagCloudProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <LoadingSpinner message="加载热门标签..." size="sm" variant="pulse" />
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title="标签统计加载失败"
        message="无法加载标签统计数据"
        type="warning"
        className="min-h-0 bg-transparent border-0"
      />
    );
  }

  if (!tags || tags.length === 0) {
    return (
      <ErrorDisplay
        title="暂无标签数据"
        message="当前没有可用的标签统计数据"
        type="warning"
        className="min-h-0 bg-transparent border-0"
      />
    );
  }

  // 计算字体大小
  const maxCount = Math.max(...tags.map((t) => t.blog_count));
  const minCount = Math.min(...tags.map((t) => t.blog_count));

  const getColor = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    if (ratio > 0.7) return "text-primary-600";
    if (ratio > 0.4) return "text-success-500";
    return "text-foreground-400";
  };

  const getSize = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    if (ratio > 0.8) return "text-lg";
    if (ratio > 0.6) return "text-base";
    if (ratio > 0.4) return "text-sm";
    return "text-xs";
  };

  return (
    <div className="bg-card-50 border border-border-50 rounded-sm p-4 sm:p-6 shadow-sm w-full max-w-full overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold text-foreground-50 mb-4">
        热门标签
      </h3>
      <div className="w-full max-w-full">
        <div className="flex flex-wrap gap-2.5 items-center justify-center py-2 px-1">
          {tags.map((tag) => (
            <Button
              key={tag.tag_slug}
              variant="outline"
              size="sm"
              className={`${getColor(tag.blog_count)} ${getSize(
                tag.blog_count
              )} hover:scale-105 backdrop-blur-sm bg-card-100/50`}
              onClick={() => router.push(`/tag/${tag.tag_slug}`)}
              title={`${tag.chinese_title} - ${tag.blog_count} 篇博客`}
            >
              {tag.chinese_title}
              <span className="ml-1.5 text-xs opacity-60">
                {tag.blog_count}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
