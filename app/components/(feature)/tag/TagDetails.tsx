"use client";

import { FileText } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import useSWR from "swr";
import BlogCard from "@/app/components/ui/card/BlogCard";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import { formatTagTitle } from "@/app/lib/utils/formatTagTitle";
import type { GetBlogListsByTagSlugResponse } from "@/app/types/blogServiceType";

interface TagDetailsProps {
  tagSlug: string;
}

const TagDetails: React.FC<TagDetailsProps> = ({ tagSlug }) => {
  const router = useRouter();
  const locale = useLocale();
  const tagT = useTranslations("tag");
  const commonT = useTranslations("common");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: blogLists,
    isLoading,
    error,
  } = useSWR<GetBlogListsByTagSlugResponse>([
    `/blog/get-blog-lists-by-tag-slug/${tagSlug}?page=${currentPage}&size=12`,
    locale,
  ]);

  if (isLoading) {
    return (
      <LoadingSpinner variant="wave" size="lg" message={commonT("loading")} fullScreen={true} />
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

  // 从 tagSlug 生成标题
  const tagTitle = formatTagTitle(tagSlug);

  // Handle case where blogLists is undefined (404 or no data)
  // The API returns an object: { items: [], pagination: {} }
  const hasData = blogLists?.items && blogLists.pagination;

  // Default values for empty state
  const { items: blogItems, pagination } = hasData
    ? blogLists
    : {
        items: [],
        pagination: {
          current_page: 1,
          page_size: 12,
          total_count: 0,
          total_pages: 0,
          has_prev: false,
          has_next: false,
          start_index: 0,
          end_index: 0,
        },
      };

  const isEmpty = !blogItems || blogItems.length === 0;

  return (
    <motion.div
      className="min-h-screen mt-12 sm:mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-3 py-12">
        {/* 页面标题区域 */}
        <motion.div
          className="text-center mb-8 sm:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 lg:mb-5 text-foreground-50 font-bold tracking-tight px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {tagTitle}
          </motion.h1>
          {!isEmpty && (
            <motion.p
              className="text-xs sm:text-sm md:text-base text-foreground-300 font-medium px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {tagT("countOfArticles", { count: pagination?.total_count || 0 })}
            </motion.p>
          )}
          {/* 分隔线 */}
          <motion.div
            className="max-w-2xl h-px bg-border-100 mx-auto mt-6 sm:mt-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
        </motion.div>

        {/* 动态内容区域 */}
        {isEmpty ? (
          <EmptyState
            icon={FileText}
            title={commonT("notFound")}
            description={commonT("notFoundMessage")}
            className="mt-4 sm:mt-6"
          />
        ) : (
          <>
            {/* 文章列表区域 */}
            <motion.div
              className="mb-8 sm:mb-12 lg:mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {blogItems.map((blog, index) => (
                  <motion.div
                    key={blog.blog_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * index }}
                  >
                    <BlogCard
                      blog={blog}
                      onClick={() => {
                        const sectionPath = blog.section_slug || "journal";
                        router.push(`/${sectionPath}/${blog.blog_slug}`);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 分页组件区域 */}
            {pagination && (
              <motion.div
                className="mb-8 sm:mb-12 lg:mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <OffsetPagination
                  pagination={pagination}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default TagDetails;
