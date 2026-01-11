import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import type { GetBlogNavigationResponse } from "@/app/types/blogServiceType";
import { Button } from "../../ui/button/butten";

interface BlogNavigationProps {
  blogId: number;
}

const BlogNavigation = ({ blogId }: BlogNavigationProps) => {
  const router = useRouter();
  const commonT = useTranslations("common");
  const {
    data: blogNavigation,
    isLoading,
    error,
  } = useSWR<GetBlogNavigationResponse>(`/blog/get-blog-navigation/${blogId}`);

  const handlePreviousClick = () => {
    if (blogNavigation?.previous) {
      router.push(`/${blogNavigation.previous.section_slug}/${blogNavigation.previous.blog_slug}`);
    }
  };

  const handleNextClick = () => {
    if (blogNavigation?.next) {
      router.push(`/${blogNavigation.next.section_slug}/${blogNavigation.next.blog_slug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner message={commonT("loading")} size="sm" fullScreen={false} variant="wave" />
      </div>
    );
  }

  if (error || !blogNavigation) {
    return null;
  }

  // 如果前后都没有博客，不显示导航
  if (!blogNavigation.previous && !blogNavigation.next) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 上一篇博客 */}
      <div className="group">
        {blogNavigation.previous ? (
          <Button
            variant="static"
            size="sm"
            className="w-full justify-start gap-3 h-16 p-4"
            onClick={handlePreviousClick}
          >
            <div className="flex items-center justify-center px-2">
              <ArrowLeftIcon className="w-7 h-7 text-primary-600 group-hover:-translate-x-2 transition-transform duration-200" />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-semibold text-foreground-50 truncate max-w-[200px] group-hover:text-primary-700 transition-colors">
                {blogNavigation.previous.blog_title}
              </span>
            </div>
          </Button>
        ) : (
          <div className="w-full h-16 flex items-center justify-center text-foreground-400 text-sm bg-background-50 rounded-md border border-border-100 border-dashed">
            <span>{commonT("noMoreContent")}</span>
          </div>
        )}
      </div>

      {/* 下一篇博客 */}
      <div className="group">
        {blogNavigation.next ? (
          <Button
            variant="static"
            size="sm"
            className="w-full justify-end gap-3 h-16 p-4"
            onClick={handleNextClick}
          >
            <div className="flex flex-col items-end min-w-0 flex-1">
              <span className="text-sm font-semibold text-foreground-50 truncate max-w-[200px] group-hover:text-primary-700 transition-colors">
                {blogNavigation.next.blog_title}
              </span>
            </div>
            <div className="flex items-center justify-center px-2">
              <ArrowRightIcon className="w-7 h-7 text-primary-600 group-hover:translate-x-2 transition-transform duration-200" />
            </div>
          </Button>
        ) : (
          <div className="w-full h-16 flex items-center justify-center text-foreground-400 text-sm bg-background-50 rounded-md border border-border-100 border-dashed">
            <span>{commonT("noMoreContent")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogNavigation;
