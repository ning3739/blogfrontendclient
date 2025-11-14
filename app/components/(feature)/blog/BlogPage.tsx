"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import type { GetBlogListsItemResponse } from "@/app/types/blogServiceType";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ContentCard from "@/app/components/ui/card/ContentCard";
import { FileText } from "lucide-react";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import { SectionListItem } from "@/app/types/sectionServiceType";

interface BlogPageProps {
  sectionData: SectionListItem;
}

const BlogPage: React.FC<BlogPageProps> = ({ sectionData }) => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const commonT = useTranslations("common");
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: blogLists,
    isLoading,
    error,
  } = useSWR(
    sectionData
      ? [
          `/blog/get-blog-lists?page=${currentPage}&size=6&section_id=${sectionData.section_id}&published_only=true`,
          locale,
        ]
      : null
  );

  // 如果 sectionData 不存在，显示加载状态
  if (!sectionData) {
    return (
      <LoadingSpinner
        variant="wave"
        size="lg"
        message={commonT("loading")}
        fullScreen={true}
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingSpinner
        variant="wave"
        size="lg"
        message={commonT("loading")}
        fullScreen={true}
      />
    );
  }

  if (error && error.status !== 404) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
        showReload={true}
      />
    );
  }

  const { items: blogItems = [], pagination } = blogLists || {};
  const isEmpty = !blogItems || blogItems.length === 0;

  return (
    <motion.div
      className="min-h-screen mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 页面标题区域 */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl mb-4 text-foreground-50 font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {sectionData.title}
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mx-auto leading-relaxed text-foreground-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {sectionData.description}
          </motion.p>

          {/* 分隔线 */}
          <motion.div
            className="max-w-2xl h-px bg-border-100 mx-auto mt-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
        </motion.div>

        {/* 项目列表区域 */}
        {isEmpty ? (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <EmptyState
              icon={FileText}
              title={commonT("notFound")}
              description={commonT("notFoundMessage")}
            />
          </motion.div>
        ) : (
          <>
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogItems.map((blog: GetBlogListsItemResponse) => (
                  <ContentCard
                    key={blog.blog_id}
                    content={{
                      id: blog.blog_id,
                      title: blog.blog_title,
                      description: blog.blog_description,
                      cover_url: blog.cover_url,
                      tags: blog.blog_tags?.map((tag) => ({
                        id: tag.tag_id,
                        title: tag.tag_title,
                      })),
                      stats: blog.blog_stats && {
                        views: blog.blog_stats.views,
                        likes: blog.blog_stats.likes,
                        comments: blog.blog_stats.comments,
                        saves: blog.blog_stats.saves,
                      },
                      created_at: blog.created_at,
                    }}
                    onClick={() => {
                      // TODO: 跳转到博客详情页
                      router.push(`${pathname}/${blog.blog_slug}`);
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* 分页组件区域 */}
            {pagination && (
              <motion.div
                className="mb-16"
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

export default BlogPage;
