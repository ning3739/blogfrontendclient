"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { BookOpen, Loader2 } from "lucide-react";
import type { GetArchivedBlogListsResponse } from "@/app/types/blogServiceType";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import BlogCard from "@/app/components/ui/card/BlogCard";
import EmptyState from "@/app/components/ui/error/EmptyState";

const ArchivePage: React.FC = () => {
  const router = useRouter();
  const archiveT = useTranslations("archive");
  const commonT = useTranslations("common");
  const [limit] = useState(2);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [allBlogs, setAllBlogs] = useState<
    GetArchivedBlogListsResponse["blogs"]
  >([]);
  const [loadMoreCursor, setLoadMoreCursor] = useState<string | null>(null);

  // 构建初始 API 端点（不传 cursor，表示第一页）
  const getInitialApiEndpoint = () => {
    return `/blog/get-archived-blog-lists?limit=${limit}`;
  };

  // 获取初始博客列表（只获取第一页）
  const {
    data: blogsData,
    isLoading,
    error,
  } = useSWR<GetArchivedBlogListsResponse>(getInitialApiEndpoint());

  // 获取更多数据（当用户点击加载更多时）
  const { data: moreBlogsData, isLoading: isLoadingMore } =
    useSWR<GetArchivedBlogListsResponse>(
      loadMoreCursor
        ? `/blog/get-archived-blog-lists?limit=${limit}&cursor=${loadMoreCursor}`
        : null
    );

  // 处理初始数据加载
  useEffect(() => {
    if (blogsData) {
      setAllBlogs(blogsData.blogs);
      setCursor(blogsData.pagination.next_cursor || null);
      setHasNext(blogsData.pagination.has_next);
    }
  }, [blogsData]);

  // 处理加载更多数据
  useEffect(() => {
    if (moreBlogsData) {
      setAllBlogs((prev) => {
        // 避免重复添加
        const newBlogs = moreBlogsData.blogs.filter(
          (newBlog) =>
            !prev.some(
              (existingBlog) => existingBlog.blog_id === newBlog.blog_id
            )
        );
        return newBlogs.length > 0 ? [...prev, ...newBlogs] : prev;
      });
      setCursor(moreBlogsData.pagination.next_cursor || null);
      setHasNext(moreBlogsData.pagination.has_next);
      setLoadMoreCursor(null); // 重置，准备下次加载
    }
  }, [moreBlogsData]);

  // 处理加载更多按钮点击
  const handleLoadMore = () => {
    if (!hasNext || isLoadingMore || !cursor) return;
    setLoadMoreCursor(cursor);
  };

  // 初始加载状态
  if (isLoading && allBlogs.length === 0) {
    return (
      <LoadingSpinner
        variant="wave"
        size="lg"
        message={commonT("loading")}
        fullScreen={true}
      />
    );
  }

  // 错误状态：只处理初始请求的错误（loadMoreError不影响整体页面状态）
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
            className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-5 text-foreground-50 font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {archiveT("title")}
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base text-foreground-300 font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {archiveT("description")}
          </motion.p>
          <motion.div
            className="max-w-2xl h-px bg-border-100 mx-auto mt-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
        </motion.div>

        {allBlogs.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={commonT("notFound")}
            description={commonT("notFoundMessage")}
          />
        ) : (
          <>
            {/* 文章列表区域 - 带时间线 */}
            <motion.div
              className="mb-16 relative bg-background-50 border border-border-100 rounded-sm p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {/* 时间线容器 */}
              <div className="relative">
                <div className="absolute left-[70px] sm:left-[108px] md:left-[126px] top-0 bottom-0 w-0.5 bg-linear-to-b from-border-100 via-border-100 to-border-100" />

                <div className="space-y-5 sm:space-y-6">
                  <AnimatePresence>
                    {allBlogs.map((blog, index) => {
                      // 获取年份
                      const blogYear = new Date(blog.created_at).getFullYear();

                      // 判断是否是该年份的第一个博客
                      // 如果是第一个博客，或者前一个博客的年份不同，则显示年份节点
                      const prevBlog = index > 0 ? allBlogs[index - 1] : null;
                      const prevYear = prevBlog
                        ? new Date(prevBlog.created_at).getFullYear()
                        : null;
                      const isFirstInYear =
                        index === 0 || prevYear !== blogYear;

                      return (
                        <motion.div
                          key={blog.blog_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4, delay: 0.05 * index }}
                          className="group relative flex items-start"
                        >
                          {/* 左侧年份区域 */}
                          <div className="shrink-0 relative z-10 flex items-center min-w-[80px] sm:min-w-[120px] md:min-w-[140px]">
                            {isFirstInYear ? (
                              <div className="flex items-center gap-2 sm:gap-3 w-full">
                                {/* 年份标签 - 在时间线左侧 */}
                                <div className="text-right flex-1">
                                  <div className="text-sm sm:text-base md:text-lg font-bold text-foreground-50 whitespace-nowrap">
                                    {blogYear}
                                  </div>
                                </div>

                                {/* 年份时间点 - 时间线穿过此点 */}
                                {/* 节点中心位置：年份区域右边界 - 节点宽度的一半 */}
                                <div className="relative z-20 shrink-0 flex items-center justify-center">
                                  <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-primary-500 border-2 border-card-50 shadow-lg group-hover:bg-primary-400 group-hover:scale-110 transition-all duration-300" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-full flex items-center justify-end relative">
                                <div className="absolute left-[66px] sm:left-[103px] md:left-[121px] z-20 flex items-center justify-center">
                                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-border-200" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 博客卡片 */}
                          <BlogCard
                            blog={blog}
                            onClick={() => {
                              const sectionPath =
                                blog.section_slug || "journal";
                              router.push(`/${sectionPath}/${blog.blog_slug}`);
                            }}
                            className="flex-1 ml-4 sm:ml-6 md:ml-8"
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* 加载更多按钮区域 */}
            {hasNext && (
              <motion.div
                className="text-center py-4 sm:py-6 mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 1.0,
                  type: "spring",
                  stiffness: 80,
                  damping: 20,
                }}
              >
                <motion.button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:bg-background-300 disabled:text-foreground-500 transition-all duration-200 flex items-center gap-2 mx-auto text-sm sm:text-base min-h-[44px] sm:min-h-[48px]"
                  whileHover={{
                    scale: 1.03,
                    transition: {
                      duration: 0.2,
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    },
                  }}
                  whileTap={{
                    scale: 0.98,
                    transition: {
                      duration: 0.1,
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    },
                  }}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 1.2,
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                  }}
                >
                  {isLoadingMore && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span className="hidden sm:inline">
                    {isLoadingMore ? commonT("loading") : archiveT("loadMore")}
                  </span>
                  <span className="sm:hidden">
                    {isLoadingMore ? commonT("loading") : archiveT("loadMore")}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ArchivePage;
