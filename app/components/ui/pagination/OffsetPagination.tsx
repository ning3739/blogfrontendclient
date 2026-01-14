"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import React from "react";
import type { OffsetPaginationResponse } from "@/app/types/commonType";

interface OffsetPaginationProps {
  pagination: OffsetPaginationResponse;
  onPageChange: (page: number) => void;
  className?: string;
}

const OffsetPagination: React.FC<OffsetPaginationProps> = ({
  pagination,
  onPageChange,
  className = "",
}) => {
  const projectT = useTranslations("project");
  const { current_page, total_pages, total_count, has_next, has_prev, start_index, end_index } =
    pagination;

  // 如果只有一页或没有数据，不显示分页
  if (total_pages <= 1) {
    return null;
  }

  // 生成页码数组
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // 最多显示5个页码

    if (total_pages <= maxVisiblePages) {
      // 如果总页数少于等于5页，显示所有页码
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      // 总是显示第一页
      pages.push(1);

      if (current_page > 3) {
        pages.push("...");
      }

      const start = Math.max(2, current_page - 1);
      const end = Math.min(total_pages - 1, current_page + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total_pages) {
          pages.push(i);
        }
      }

      if (current_page < total_pages - 2) {
        pages.push("...");
      }

      // 总是显示最后一页
      if (total_pages > 1) {
        pages.push(total_pages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <motion.div
      className={`w-full ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 分割线 */}
      <motion.div
        className="w-full h-px mb-4 bg-border-100"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      />

      {/* 分页控件容器 */}
      <motion.div
        className="rounded-sm p-4 sm:p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        whileHover={{ scale: 1.01 }}
      >
        {/* 信息显示 */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-foreground-300">
            {projectT("pagination.show", {
              start: start_index,
              end: end_index,
              total: total_count,
            })}
          </p>
        </div>

        {/* 分页按钮 */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* 上一页按钮 */}
            <motion.button
              className={`group flex items-center justify-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-sm border border-transparent transition-colors duration-200 ${
                has_prev
                  ? "text-foreground-300 hover:text-foreground-50 hover:bg-card-200 hover:border-border-200"
                  : "text-foreground-400 cursor-not-allowed"
              }`}
              onClick={() => has_prev && onPageChange(current_page - 1)}
              disabled={!has_prev}
              whileHover={has_prev ? { scale: 1.05, y: -2 } : {}}
              whileTap={has_prev ? { scale: 0.95 } : {}}
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">{projectT("pagination.previous")}</span>
              <span className="sm:hidden">{projectT("pagination.previous")}</span>
            </motion.button>

            {/* 分隔线 */}
            <div className="w-px h-6 bg-border-100" />

            {/* 页码按钮容器 */}
            <div className="flex items-center space-x-1">
              {pageNumbers.map((page, index) => (
                <React.Fragment
                  key={typeof page === "number" ? `page-${page}` : `ellipsis-${index}`}
                >
                  {page === "..." ? (
                    <span className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-foreground-400">
                      ⋯
                    </span>
                  ) : (
                    <motion.button
                      className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium rounded-sm border border-transparent transition-colors duration-200 ${
                        page === current_page
                          ? "text-white bg-primary-600 shadow-lg"
                          : "text-foreground-300 hover:text-foreground-50 hover:bg-card-200 hover:border-border-200"
                      }`}
                      onClick={() => onPageChange(page as number)}
                      whileHover={page !== current_page ? { scale: 1.05, y: -2 } : {}}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      {page}
                    </motion.button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* 分隔线 */}
            <div className="w-px h-6 bg-border-100" />

            {/* 下一页按钮 */}
            <motion.button
              className={`group flex items-center justify-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-sm border border-transparent transition-colors duration-200 ${
                has_next
                  ? "text-foreground-300 hover:text-foreground-50 hover:bg-card-200 hover:border-border-200"
                  : "text-foreground-400 cursor-not-allowed"
              }`}
              onClick={() => has_next && onPageChange(current_page + 1)}
              disabled={!has_next}
              whileHover={has_next ? { scale: 1.05, y: -2 } : {}}
              whileTap={has_next ? { scale: 0.95 } : {}}
            >
              <span className="hidden sm:inline">{projectT("pagination.next")}</span>
              <span className="sm:hidden">{projectT("pagination.next")}</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 transition-transform duration-200 group-hover:translate-x-0.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OffsetPagination;
