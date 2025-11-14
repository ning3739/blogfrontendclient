"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Eye, Trash2, FileText } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { GetMySavedBlogItemResponse } from "@/app/types/userServiceType";
import { OffsetPaginationResponse } from "@/app/types/commonType";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import BlogService from "@/app/lib/services/blogService";

interface SavedBlogListsProps {
  savedBlogItems: GetMySavedBlogItemResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void;
}

const SavedBlogLists: React.FC<SavedBlogListsProps> = ({
  savedBlogItems,
  pagination,
  setCurrentPage,
  onDataChange,
}) => {
  const format = useFormatter();
  const dashboardT = useTranslations("dashboard.mySaved");
  const commonT = useTranslations("common");
  const [blogItems, setBlogItems] = useState(savedBlogItems);
  const [removingIds, setRemovingIds] = useState<number[]>([]);

  // Sync blogItems with savedBlogItems prop changes
  useEffect(() => {
    setBlogItems(savedBlogItems);
  }, [savedBlogItems]);

  const handleRemoveSave = async (blogId: number) => {
    if (removingIds.includes(blogId)) return;

    setRemovingIds((prev) => [...prev, blogId]);

    try {
      // 调用取消收藏 API
      await BlogService.saveBlogButton({ blog_id: blogId });

      // 使用 mutate 重新获取数据
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Failed to unsave blog:", error);
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== blogId));
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-50">
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  {dashboardT("blogTitle")}
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  {dashboardT("savedAt")}
                </th>
                <th className="text-right py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  {commonT("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {blogItems.map(
                (blog: GetMySavedBlogItemResponse, index: number) => (
                  <motion.tr
                    key={blog.blog_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                  >
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                          {blog.cover_url ? (
                            <Image
                              src={blog.cover_url}
                              alt={`${blog.blog_title} cover`}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-foreground-200" />
                          )}
                        </div>
                        <Link
                          href={`/${blog.section_slug}/${blog.blog_slug}`}
                          className="flex-1 min-w-0"
                        >
                          <p className="text-xs lg:text-sm font-medium text-foreground-50 truncate hover:text-primary-500 transition-colors">
                            {blog.blog_title}
                          </p>
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <p className="text-xs lg:text-sm text-foreground-200">
                        {handleDateFormat(blog.saved_at, format)}
                      </p>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <div className="flex justify-end space-x-1 lg:space-x-2">
                        <Link href={`/${blog.section_slug}/${blog.blog_slug}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 lg:p-2 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                            title="查看博客"
                          >
                            <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveSave(blog.blog_id)}
                          disabled={removingIds.includes(blog.blog_id)}
                          className="p-1.5 lg:p-2 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors disabled:opacity-50"
                          title="取消收藏"
                        >
                          <Trash2
                            className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${
                              removingIds.includes(blog.blog_id)
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        <div className="space-y-3">
          {blogItems.map((blog: GetMySavedBlogItemResponse, index: number) => (
            <motion.div
              key={blog.blog_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                    {blog.cover_url ? (
                      <Image
                        src={blog.cover_url}
                        alt={`${blog.blog_title} cover`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-7 h-7 text-foreground-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${blog.section_slug}/${blog.blog_slug}`}
                      className="flex-1 min-w-0"
                    >
                      <h3 className="text-sm font-medium text-foreground-50 truncate hover:text-primary-500 transition-colors">
                        {blog.blog_title}
                      </h3>
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-foreground-300">
                    {handleDateFormat(blog.saved_at, format)}
                  </p>
                </div>

                <div className="flex justify-end space-x-1">
                  <Link href={`/${blog.section_slug}/${blog.blog_slug}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                      title="查看博客"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemoveSave(blog.blog_id)}
                    disabled={removingIds.includes(blog.blog_id)}
                    className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors disabled:opacity-50"
                    title="取消收藏"
                  >
                    <Trash2
                      className={`w-3.5 h-3.5 ${
                        removingIds.includes(blog.blog_id) ? "animate-spin" : ""
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {blogItems.map((blog: GetMySavedBlogItemResponse, index: number) => (
          <motion.div
            key={blog.blog_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="space-y-2.5">
              {/* Blog Header */}
              <div className="flex items-start space-x-2.5">
                <div className="w-12 h-12 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                  {blog.cover_url ? (
                    <Image
                      src={blog.cover_url}
                      alt={`${blog.blog_title} cover`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-5 h-5 text-foreground-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/${blog.section_slug}/${blog.blog_slug}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-sm font-medium text-foreground-50 truncate hover:text-primary-500 transition-colors">
                      {blog.blog_title}
                    </h3>
                  </Link>
                </div>
              </div>

              {/* Blog Meta */}
              <div className="space-y-1">
                <p className="text-xs text-foreground-300">
                  {handleDateFormat(blog.saved_at, format)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end -mr-1">
                <div className="flex space-x-1">
                  <Link href={`/${blog.section_slug}/${blog.blog_slug}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors active:bg-primary-100"
                      title="查看博客"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemoveSave(blog.blog_id)}
                    disabled={removingIds.includes(blog.blog_id)}
                    className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors active:bg-error-100 disabled:opacity-50"
                    title="取消收藏"
                  >
                    <Trash2
                      className={`w-3.5 h-3.5 ${
                        removingIds.includes(blog.blog_id) ? "animate-spin" : ""
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {blogItems.length > 0 && (
        <div className="mt-6">
          <OffsetPagination
            pagination={pagination}
            onPageChange={(page) => {
              setCurrentPage(page);
              // Scroll to top when page changes
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SavedBlogLists;
