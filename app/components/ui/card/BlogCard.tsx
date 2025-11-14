"use client";

import React from "react";
import { Clock, ArrowRight } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import type { GetBlogListsItem } from "@/app/types/blogServiceType";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";

interface BlogCardProps {
  blog: GetBlogListsItem;
  onClick: () => void;
  className?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  onClick,
  className = "",
}) => {
  const format = useFormatter();
  const commonT = useTranslations("common");

  return (
    <div
      onClick={onClick}
      className={`group relative bg-card-50 border border-border-50 rounded-sm p-6 sm:p-7 hover:border-primary-300/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
    >
      {/* 左侧装饰条 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500/0 via-primary-500/50 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-5 sm:gap-6">
        {/* 左侧内容 */}
        <div className="flex-1 min-w-0 space-y-3">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground-50 group-hover:text-primary-500 transition-colors duration-300 line-clamp-2 leading-snug">
            {blog.blog_title}
          </h3>
          <p className="text-sm sm:text-base text-foreground-300 line-clamp-2 leading-relaxed">
            {blog.blog_description}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2">
            {/* 发布日期 */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Clock
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground-400 flex-shrink-0"
                strokeWidth={2}
              />
              <span className="text-foreground-300 font-medium whitespace-nowrap">
                {handleDateFormat(blog.created_at, format)}
              </span>
            </div>

            {/* 更新日期 */}
            {blog.updated_at && (
              <>
                <span className="text-border-200 text-xs">•</span>
                <span className="text-xs sm:text-sm text-foreground-400 whitespace-nowrap">
                  {commonT("updatedAt")}:{" "}
                  <span className="text-foreground-300">
                    {handleDateFormat(blog.updated_at, format)}
                  </span>
                </span>
              </>
            )}

            {/* 分隔符和分类 */}
            <span className="text-border-200 text-xs">•</span>
            <span className="text-xs sm:text-sm text-foreground-400 capitalize whitespace-nowrap">
              {blog.section_slug}
            </span>
          </div>
        </div>

        {/* 右侧箭头图标 */}
        <div className="flex-shrink-0 mt-1">
          <div className="relative">
            <ArrowRight
              className="w-5 h-5 sm:w-6 sm:h-6 text-foreground-400 group-hover:text-primary-500 transform group-hover:translate-x-1 group-hover:rotate-45 transition-all duration-300"
              strokeWidth={2.5}
            />
          </div>
        </div>
      </div>

      {/* 悬停时的背景渐变效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/3 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm pointer-events-none" />
    </div>
  );
};

export default BlogCard;
