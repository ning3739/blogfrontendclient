"use client";

import { FileText, Tag } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type React from "react";
import useSWR from "swr";
import CommentList from "@/app/components/(feature)/comment/CommentList";
import { Button } from "@/app/components/ui/button/butten";
import CopyRight from "@/app/components/ui/copyright/CopyRight";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import Subscribe from "@/app/components/(feature)/home/Subscribe";
import Share from "@/app/components/ui/share/Share";
import { useAuth } from "@/app/contexts/hooks/useAuth";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { GetBlogDetailsResponse } from "@/app/types/blogServiceType";
import CommentTextInput, { CommentType } from "../comment/CommentTextInput";
import TextContent from "../content/TextContent";
import TOC from "../content/TOC";
import BlogAction from "./BlogAction";
import BlogNavigation from "./BlogNavigation";
import BlogStats from "./BlogStats";

interface BlogDetailsProps {
  blogSlug: string;
  sectionTitle?: string;
  sectionDescription?: string;
}

const BlogDetails: React.FC<BlogDetailsProps> = ({ blogSlug }) => {
  const router = useRouter();
  const locale = useLocale();
  const format = useFormatter();
  const pathname = usePathname();
  const commonT = useTranslations("common");
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`;
  const { isAuthenticated, user } = useAuth();

  const {
    data: blogDetails,
    isLoading,
    error,
  } = useSWR<GetBlogDetailsResponse>(
    isAuthenticated && user?.user_id
      ? [
          `/blog/get-blog-details/${blogSlug}?is_editor=false&user_id=${user.user_id}`,
          locale,
        ]
      : [`/blog/get-blog-details/${blogSlug}?is_editor=false`, locale]
  );

  const handleTagClick = (tagSlug: string) => {
    router.push(`/tag/${tagSlug}`);
  };

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

  // 错误处理：优先检查404
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
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        {blogDetails ? (
          <>
            {/* 博客封面区域 */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {blogDetails?.cover_url && (
                <motion.div
                  className="relative w-full h-64 md:h-80 mb-16 rounded-sm overflow-hidden cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Image
                    src={blogDetails?.cover_url || ""}
                    alt={blogDetails?.blog_name || ""}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    priority
                  />
                </motion.div>
              )}

              <motion.h1
                className="text-4xl mb-4 text-foreground-50 font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {blogDetails?.blog_name}
              </motion.h1>

              <motion.p
                className="text-lg max-w-2xl mx-auto leading-relaxed text-foreground-300 font-medium mb-4 italic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {commonT("summary")}: {blogDetails?.blog_description}
              </motion.p>

              {/* 标签列表 */}
              {blogDetails?.blog_tags && blogDetails.blog_tags.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-2 justify-center mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  {blogDetails.blog_tags.map((tag) => (
                    <Button
                      key={tag.tag_id}
                      onClick={() => handleTagClick(tag.tag_slug)}
                      variant="secondary"
                      size="sm"
                      className="inline-flex items-center gap-1 bg-primary-100 text-primary-600 hover:bg-primary-200 hover:text-primary-700"
                    >
                      <Tag className="w-3.5 h-3.5" strokeWidth={2} />
                      {tag.tag_title}
                    </Button>
                  ))}
                </motion.div>
              )}

              {/* 时间信息 */}
              <motion.div
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                {/* 创建时间 */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-success-500"></div>
                  <span className="text-foreground-400 text-xs font-medium">
                    {commonT("createdAt")}:
                  </span>
                  <span className="text-foreground-200 font-semibold text-sm">
                    {handleDateFormat(blogDetails?.created_at || "", format)}
                  </span>
                </div>

                {/* 更新时间 */}
                {blogDetails?.updated_at && (
                  <>
                    <div className="hidden sm:block w-px h-4 bg-border-200"></div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-warning-500"></div>
                      <span className="text-foreground-400 text-xs font-medium">
                        {commonT("updatedAt")}:
                      </span>
                      <span className="text-foreground-200 font-semibold text-sm">
                        {handleDateFormat(
                          blogDetails?.updated_at || "",
                          format
                        )}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>

              {/* 分隔线 */}
              <motion.div
                className="max-w-2xl h-px bg-border-100 mx-auto"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              />

              {/* 博客统计数据 */}
              <motion.div
                className="my-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.15 }}
              >
                <BlogStats
                  blogId={blogDetails?.blog_id || 0}
                  isSaved={blogDetails?.is_saved ?? false}
                />
              </motion.div>

              {/* 博客操作区域 */}
              <motion.div
                className="m-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="flex items-center gap-3">
                  <BlogAction blogId={blogDetails?.blog_id || 0} />
                </div>
              </motion.div>
            </motion.div>

            {/* 博客内容区域 */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <TOC />
              <TextContent content={blogDetails?.blog_content || ""} />
            </motion.div>

            {/* 版权信息 */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <CopyRight permalink={canonical} licenseText="CC BY-NC 4.0" />
            </motion.div>

            {/* 分享按钮 */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <Share
                url={canonical}
                title={blogDetails?.blog_name || ""}
                createdAtText={`${commonT("createdAt")}: ${handleDateFormat(
                  blogDetails?.created_at || "",
                  format
                )}`}
              />
            </motion.div>

            {/* 分隔线 */}
            <motion.div
              className="w-full h-px bg-border-100 mx-auto mb-8"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            />

            {/* 博客导航 */}
            <motion.div
              className="my-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
            >
              <BlogNavigation blogId={blogDetails?.blog_id || 0} />
            </motion.div>

            {/* 分隔线 */}
            <motion.div
              className="w-full h-px bg-border-100 mx-auto mb-16"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            />
            {/* 订阅区域 */}
            {!isAuthenticated && <Subscribe />}

            {/* 评论区域 */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div
                className="rounded-sm p-8 border bg-card-100 border-border-100"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                whileHover={{ scale: 1.02 }}
              >
                <CommentTextInput
                  type={CommentType.BLOG}
                  blog_id={blogDetails?.blog_id || 0}
                  isAuthenticated={isAuthenticated}
                />
              </motion.div>
            </motion.div>

            {/* 评论列表区域 */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <motion.div
                className="w-full h-px mb-16 bg-border-100"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.6 }}
              ></motion.div>
              <CommentList
                type={CommentType.BLOG}
                targetId={blogDetails?.blog_id || 0}
                isAuthenticated={isAuthenticated}
              />
            </motion.div>
          </>
        ) : (
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
              iconSize="w-12 h-12"
              iconBgSize="w-24 h-24"
              iconColor="text-primary-400"
              iconBgColor="bg-primary-50"
              variant="default"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BlogDetails;
