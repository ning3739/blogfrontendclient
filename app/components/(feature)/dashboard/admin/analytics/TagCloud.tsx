import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button/Button";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import type { TagStatistic } from "@/app/types/analyticServiceType";

interface TagCloudProps {
  tags?: TagStatistic[];
  isLoading?: boolean;
  error?: unknown;
}

export default function TagCloud({ tags, isLoading, error }: TagCloudProps) {
  const router = useRouter();

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-card-50 border border-border-50 rounded-sm p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground-50 mb-4">热门标签</h3>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="sm" variant="pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card-50 border border-border-50 rounded-sm p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground-50 mb-4">热门标签</h3>
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-foreground-400">加载失败</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!tags || tags.length === 0) {
    return (
      <div className="bg-card-50 border border-border-50 rounded-sm p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground-50 mb-4">热门标签</h3>
        <div className="py-8" />
      </div>
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
      <h3 className="text-base sm:text-lg font-semibold text-foreground-50 mb-4">热门标签</h3>
      <div className="w-full max-w-full">
        <div className="flex flex-wrap gap-2.5 items-center justify-center py-2 px-1">
          {tags.map((tag) => (
            <Button
              key={tag.tag_slug}
              variant="outline"
              size="sm"
              className={`${getColor(tag.blog_count)} ${getSize(
                tag.blog_count,
              )} hover:scale-105 backdrop-blur-sm bg-card-100/50`}
              onClick={() => router.push(`/tag/${tag.tag_slug}`)}
              title={`${tag.chinese_title} - ${tag.blog_count} 篇博客`}
            >
              {tag.chinese_title}
              <span className="ml-1.5 text-xs opacity-60">{tag.blog_count}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
