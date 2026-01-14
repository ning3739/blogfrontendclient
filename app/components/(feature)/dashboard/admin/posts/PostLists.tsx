"use client";

import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Edit,
  Eye,
  FileText,
  Globe,
  Globe2,
  Info,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormatter, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PostInfoModel from "@/app/components/(feature)/dashboard/admin/posts/PostInfoModel";
import { Button } from "@/app/components/ui/button/butten";
import Modal from "@/app/components/ui/modal/Modal";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import BlogService from "@/app/lib/services/blogService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { BlogItemDashboardResponse } from "@/app/types/blogServiceType";
import type { OffsetPaginationResponse } from "@/app/types/commonType";

interface PostListsProps {
  postItems: BlogItemDashboardResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void; // Optional callback for data refresh
}

const PostLists = ({ postItems, pagination, setCurrentPage, onDataChange }: PostListsProps) => {
  const _locale = useLocale();
  const format = useFormatter();
  const router = useRouter();
  const [optimisticPosts, setOptimisticPosts] = useState<BlogItemDashboardResponse[]>(postItems);
  const [blogInfoModel, setBlogInfoModel] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogItemDashboardResponse | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogItemDashboardResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>("");
  // Update optimistic posts when postItems prop changes
  useEffect(() => {
    setOptimisticPosts(postItems);
  }, [postItems]);

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;

    setIsDeleting(true);
    setDeleteError(""); // Clear previous error
    const blogSlug = blogToDelete.blog_slug;
    const postId = blogToDelete.blog_id;

    try {
      // Call API first
      const response = await BlogService.deleteBlog({
        blog_id: postId,
      });

      if (response.status === 200) {
        // Optimistic update - remove from UI after successful API call
        setOptimisticPosts((prevPosts) => prevPosts.filter((p) => p.blog_slug !== blogSlug));

        toast.success("message" in response ? response.message : "文章删除成功");

        // Close modal
        setDeleteConfirmModal(false);
        setBlogToDelete(null);
        setDeleteError("");

        // Refresh list after successful deletion
        if (onDataChange) {
          onDataChange();
        }
      } else {
        // Show error message from backend in modal
        const errorMsg = "error" in response ? response.error : "删除文章失败";
        setDeleteError(errorMsg);
      }
    } catch (err) {
      // Handle errors from httpClient (ErrorResponse type)
      const error = err as { status?: number; error?: string };
      const errorMsg = error.error || "删除文章失败，请稍后重试";
      setDeleteError(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActionClick = async (
    action: string,
    blogSlug: string,
    statusType?: "is_published" | "is_archived" | "is_featured",
    newValue?: boolean,
  ) => {
    const post = optimisticPosts.find((p) => p.blog_slug === blogSlug);

    if (!post) {
      console.error("Blog not found:", blogSlug);
      return;
    }

    const postId = post.blog_id;

    if (action === "view") {
      // Navigate to blog preview page
      router.push(`/dashboard/preview/?blogSlug=${blogSlug}&type=blog`);
    } else if (action === "title_click") {
      // Navigate to actual blog details page only if published
      if (post.is_published) {
        const sectionSlug = post.section_slug;
        router.push(`/${sectionSlug}/${blogSlug}`);
      } else {
        // If not published, go to preview page
        router.push(`/dashboard/preview/?blogSlug=${blogSlug}&type=blog`);
      }
    } else if (action === "info") {
      // blog info model
      if (post) {
        setSelectedBlog(post);
        setBlogInfoModel(true);
      }
    } else if (action === "edit") {
      // Navigate to blog edit page
      router.push(`/dashboard/editor/?blogSlug=${blogSlug}&type=update`);
    } else if (action === "status_update" && statusType && newValue !== undefined) {
      // Handle status updates (publish, archive, feature)
      try {
        // Optimistic update - immediately update UI
        setOptimisticPosts((prevPosts) =>
          prevPosts.map((p) => (p.blog_slug === blogSlug ? { ...p, [statusType]: newValue } : p)),
        );

        // Call API in background
        const response = await BlogService.updateBlogStatus({
          blog_id: postId,
          [statusType]: newValue,
        });

        if (response.status === 200) {
          toast.success("message" in response ? response.message : "Blog status updated");
          // Refresh list after successful update
          if (onDataChange) {
            onDataChange();
          }
        } else {
          toast.error("error" in response ? response.error : "Failed to update blog status");
          setOptimisticPosts(postItems);
        }
      } catch (error) {
        // Rollback on error
        console.error(`Failed to update ${statusType}:`, error);
        toast.error("Failed to update blog status");
        setOptimisticPosts(postItems);
      }
    } else if (action === "delete") {
      // Show confirmation modal
      if (post) {
        setBlogToDelete(post);
        setDeleteConfirmModal(true);
      }
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
                  文章
                </th>
                <th className="text-center py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  状态
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  创建时间
                </th>
                <th className="text-right py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {optimisticPosts.map((post: BlogItemDashboardResponse, index: number) => (
                <motion.tr
                  key={post.blog_slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                >
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                        {post.cover_url ? (
                          <Image
                            src={post.cover_url}
                            alt={`${post.blog_title} cover`}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-6 h-6 text-foreground-200" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleActionClick("title_click", post.blog_slug)}
                          className="text-xs lg:text-sm font-medium text-foreground-50 hover:text-primary-500 transition-colors cursor-pointer text-left truncate w-full"
                        >
                          {post.blog_title}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex justify-center space-x-1">
                      {/* Published Status - Display Only */}
                      {post.is_published && (
                        <span className="px-2 py-1 text-xs rounded-sm font-medium bg-success-50 text-success-500">
                          已发布
                        </span>
                      )}

                      {/* Archived Status - Display Only */}
                      {post.is_archived && (
                        <span className="px-2 py-1 text-xs rounded-sm font-medium bg-warning-50 text-warning-500">
                          已归档
                        </span>
                      )}

                      {/* Featured Status - Display Only */}
                      {post.is_featured && (
                        <span className="px-2 py-1 text-xs rounded-sm font-medium bg-primary-50 text-primary-500">
                          精选
                        </span>
                      )}

                      {/* Show "Draft" if not published */}
                      {!post.is_published && !post.is_archived && !post.is_featured && (
                        <span className="px-2 py-1 text-xs rounded-sm font-medium bg-warning-50 text-warning-500">
                          草稿
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <p className="text-xs lg:text-sm text-foreground-200">
                      {handleDateFormat(post.created_at, format)}
                    </p>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex justify-end space-x-1 lg:space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("info", post.blog_slug)}
                        className="p-1.5 lg:p-2 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors"
                        title="文章信息"
                      >
                        <Info className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("view", post.blog_slug)}
                        className="p-1.5 lg:p-2 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("edit", post.blog_slug)}
                        className="p-1.5 lg:p-2 bg-primary-50 text-primary-500 rounded-sm hover:bg-primary-100 transition-colors"
                        title="编辑文章"
                      >
                        <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>

                      {/* Status Action Buttons */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleActionClick(
                            "status_update",
                            post.blog_slug,
                            "is_published",
                            !post.is_published,
                          )
                        }
                        className={`p-1.5 lg:p-2 rounded-sm transition-colors ${
                          post.is_published
                            ? "bg-success-50 text-success-500 hover:bg-success-100"
                            : "bg-background-50 text-foreground-300 hover:bg-background-100"
                        }`}
                        title={post.is_published ? "取消发布" : "发布"}
                      >
                        {post.is_published ? (
                          <Globe className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        ) : (
                          <Globe2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleActionClick(
                            "status_update",
                            post.blog_slug,
                            "is_archived",
                            !post.is_archived,
                          )
                        }
                        className={`p-1.5 lg:p-2 rounded-sm transition-colors ${
                          post.is_archived
                            ? "bg-warning-50 text-warning-500 hover:bg-warning-100"
                            : "bg-background-50 text-foreground-300 hover:bg-background-100"
                        }`}
                        title={post.is_archived ? "取消归档" : "归档"}
                      >
                        {post.is_archived ? (
                          <Archive className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        ) : (
                          <ArchiveRestore className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleActionClick(
                            "status_update",
                            post.blog_slug,
                            "is_featured",
                            !post.is_featured,
                          )
                        }
                        className={`p-1.5 lg:p-2 rounded-sm transition-colors ${
                          post.is_featured
                            ? "bg-primary-50 text-primary-500 hover:bg-primary-100"
                            : "bg-background-50 text-foreground-300 hover:bg-background-100"
                        }`}
                        title={post.is_featured ? "取消精选" : "设为精选"}
                      >
                        {post.is_featured ? (
                          <Star className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        ) : (
                          <StarOff className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("delete", post.blog_slug)}
                        className="p-1.5 lg:p-2 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                        title="删除文章"
                      >
                        <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        <div className="space-y-3">
          {optimisticPosts.map((post: BlogItemDashboardResponse, index: number) => (
            <motion.div
              key={post.blog_slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                    {post.cover_url ? (
                      <Image
                        src={post.cover_url}
                        alt={`${post.blog_title} cover`}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-foreground-200" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleActionClick("title_click", post.blog_slug)}
                      className="text-sm font-medium text-foreground-50 hover:text-primary-500 transition-colors cursor-pointer text-left truncate w-full"
                    >
                      {post.blog_title}
                    </button>
                    <p className="text-xs text-foreground-300 truncate mt-1">
                      {post.blog_description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-foreground-300">
                        {handleDateFormat(post.created_at, format)}
                      </span>
                      {/* Status Tags */}
                      <div className="flex items-center gap-1">
                        {post.is_published && (
                          <span className="px-2 py-0.5 text-xs rounded-sm font-medium bg-success-50 text-success-500">
                            已发布
                          </span>
                        )}
                        {post.is_archived && (
                          <span className="px-2 py-0.5 text-xs rounded-sm font-medium bg-warning-50 text-warning-500">
                            已归档
                          </span>
                        )}
                        {post.is_featured && (
                          <span className="px-2 py-0.5 text-xs rounded-sm font-medium bg-primary-50 text-primary-500">
                            精选
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("info", post.blog_slug)}
                    className="p-1.5 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors"
                    title="View Details"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("view", post.blog_slug)}
                    className="p-1.5 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("edit", post.blog_slug)}
                    className="p-1.5 bg-primary-50 text-primary-500 rounded-sm hover:bg-primary-100 transition-colors"
                    title="Edit Post"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </motion.button>

                  {/* Status Action Buttons */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleActionClick(
                        "status_update",
                        post.blog_slug,
                        "is_published",
                        !post.is_published,
                      )
                    }
                    className={`p-1.5 rounded-sm transition-colors ${
                      post.is_published
                        ? "bg-success-50 text-success-500 hover:bg-success-100"
                        : "bg-background-50 text-foreground-300 hover:bg-background-100"
                    }`}
                    title={post.is_published ? "取消发布" : "发布"}
                  >
                    {post.is_published ? (
                      <Globe className="w-3.5 h-3.5" />
                    ) : (
                      <Globe2 className="w-3.5 h-3.5" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleActionClick(
                        "status_update",
                        post.blog_slug,
                        "is_archived",
                        !post.is_archived,
                      )
                    }
                    className={`p-1.5 rounded-sm transition-colors ${
                      post.is_archived
                        ? "bg-warning-50 text-warning-500 hover:bg-warning-100"
                        : "bg-background-50 text-foreground-300 hover:bg-background-100"
                    }`}
                    title={post.is_archived ? "取消归档" : "归档"}
                  >
                    {post.is_archived ? (
                      <Archive className="w-3.5 h-3.5" />
                    ) : (
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleActionClick(
                        "status_update",
                        post.blog_slug,
                        "is_featured",
                        !post.is_featured,
                      )
                    }
                    className={`p-1.5 rounded-sm transition-colors ${
                      post.is_featured
                        ? "bg-primary-50 text-primary-500 hover:bg-primary-100"
                        : "bg-background-50 text-foreground-300 hover:bg-background-100"
                    }`}
                    title={post.is_featured ? "取消精选" : "设为精选"}
                  >
                    {post.is_featured ? (
                      <Star className="w-3.5 h-3.5" />
                    ) : (
                      <StarOff className="w-3.5 h-3.5" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("delete", post.blog_slug)}
                    className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                    title="删除文章"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {optimisticPosts.map((post: BlogItemDashboardResponse, index: number) => (
          <motion.div
            key={post.blog_slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="space-y-2.5">
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                    {post.cover_url ? (
                      <Image
                        src={post.cover_url}
                        alt={`${post.blog_title} cover`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-foreground-200" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleActionClick("title_click", post.blog_slug)}
                      className="text-sm font-medium text-foreground-50 hover:text-primary-500 transition-colors cursor-pointer text-left truncate w-full"
                    >
                      {post.blog_title}
                    </button>
                  </div>
                </div>
              </div>

              {/* Post Meta */}
              <div className="space-y-2">
                {/* Status and Date Row */}
                <div className="flex items-center justify-between">
                  {/* Status Tags */}
                  <div className="flex items-center gap-1">
                    {post.is_published && (
                      <span className="px-2 py-0.5 text-[10px] rounded-sm font-medium bg-success-50 text-success-500">
                        已发布
                      </span>
                    )}
                    {post.is_archived && (
                      <span className="px-2 py-0.5 text-[10px] rounded-sm font-medium bg-warning-50 text-warning-500">
                        已归档
                      </span>
                    )}
                    {post.is_featured && (
                      <span className="px-2 py-0.5 text-[10px] rounded-sm font-medium bg-primary-50 text-primary-500">
                        精选
                      </span>
                    )}
                    {/* Show "Draft" if not published */}
                    {!post.is_published && !post.is_archived && !post.is_featured && (
                      <span className="px-2 py-0.5 text-[10px] rounded-sm font-medium bg-warning-50 text-warning-500">
                        草稿
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-foreground-300">
                    {handleDateFormat(post.created_at, format)}
                  </span>
                </div>

                {/* Actions Row */}
                <div className="space-y-2">
                  {/* Primary Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("info", post.blog_slug)}
                        className="p-2 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors active:bg-background-200"
                        title="文章信息"
                      >
                        <Info className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("view", post.blog_slug)}
                        className="p-2 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors active:bg-background-200"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("edit", post.blog_slug)}
                        className="p-2 bg-primary-50 text-primary-500 rounded-sm hover:bg-primary-100 transition-colors active:bg-primary-100"
                        title="编辑文章"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center justify-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleActionClick(
                          "status_update",
                          post.blog_slug,
                          "is_published",
                          !post.is_published,
                        )
                      }
                      className={`px-3 py-1.5 rounded-sm transition-colors text-xs font-medium ${
                        post.is_published
                          ? "bg-success-50 text-success-500 hover:bg-success-100"
                          : "bg-background-50 text-foreground-300 hover:bg-background-100"
                      }`}
                      title={post.is_published ? "取消发布" : "发布"}
                    >
                      {post.is_published ? (
                        <Globe className="w-3 h-3 inline mr-1" />
                      ) : (
                        <Globe2 className="w-3 h-3 inline mr-1" />
                      )}
                      {post.is_published ? "取消发布" : "发布"}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleActionClick(
                          "status_update",
                          post.blog_slug,
                          "is_archived",
                          !post.is_archived,
                        )
                      }
                      className={`px-3 py-1.5 rounded-sm transition-colors text-xs font-medium ${
                        post.is_archived
                          ? "bg-warning-50 text-warning-500 hover:bg-warning-100"
                          : "bg-background-50 text-foreground-300 hover:bg-background-100"
                      }`}
                      title={post.is_archived ? "取消归档" : "归档"}
                    >
                      {post.is_archived ? (
                        <Archive className="w-3 h-3 inline mr-1" />
                      ) : (
                        <ArchiveRestore className="w-3 h-3 inline mr-1" />
                      )}
                      {post.is_archived ? "取消归档" : "归档"}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleActionClick(
                          "status_update",
                          post.blog_slug,
                          "is_featured",
                          !post.is_featured,
                        )
                      }
                      className={`px-3 py-1.5 rounded-sm transition-colors text-xs font-medium ${
                        post.is_featured
                          ? "bg-primary-50 text-primary-500 hover:bg-primary-100"
                          : "bg-background-50 text-foreground-300 hover:bg-background-100"
                      }`}
                      title={post.is_featured ? "取消精选" : "设为精选"}
                    >
                      {post.is_featured ? (
                        <Star className="w-3 h-3 inline mr-1" />
                      ) : (
                        <StarOff className="w-3 h-3 inline mr-1" />
                      )}
                      {post.is_featured ? "取消精选" : "设为精选"}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActionClick("delete", post.blog_slug)}
                      className="px-3 py-1.5 rounded-sm transition-colors text-xs font-medium bg-error-50 text-error-400 hover:bg-error-100"
                      title="删除文章"
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" />
                      删除
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {optimisticPosts.length > 0 && (
        <div className="mt-6">
          <OffsetPagination
            pagination={pagination}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        </div>
      )}

      {/* Post Info Modal */}
      <PostInfoModel
        isOpen={blogInfoModel}
        onClose={() => {
          setBlogInfoModel(false);
          setSelectedBlog(null);
        }}
        blogData={selectedBlog}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmModal}
        onClose={() => {
          if (!isDeleting) {
            setDeleteConfirmModal(false);
            setBlogToDelete(null);
            setDeleteError("");
          }
        }}
        title="确认删除文章"
        size="md"
        closeOnOverlayClick={!isDeleting}
        footer={
          <>
            <Button
              onClick={() => {
                setDeleteConfirmModal(false);
                setBlogToDelete(null);
                setDeleteError("");
              }}
              variant="outline"
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-error-400 hover:bg-error-500 focus:ring-error-500"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  <span>删除中...</span>
                </>
              ) : (
                <span>确认删除</span>
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Error Message Display */}
          {deleteError && (
            <div className="p-3 bg-error-50 rounded-sm border border-error-100">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-error-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-error-500 font-medium">{deleteError}</p>
              </div>
            </div>
          )}

          {/* Warning Icon and Description */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-error-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground-200 leading-relaxed">
                您确定要删除这篇文章吗？删除后将无法恢复，所有相关数据（包括评论、统计数据等）都将被永久删除。
              </p>
            </div>
          </div>

          {/* Item Name Display */}
          {blogToDelete && (
            <div className="p-3 bg-background-100 rounded-sm border border-border-100">
              <p className="text-sm font-medium text-foreground-100 break-words">
                {blogToDelete.blog_title}
              </p>
            </div>
          )}

          {/* Warning Message */}
          <div className="p-3 bg-warning-50 rounded-sm border border-warning-100">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-warning-500 font-medium">
                此操作无法撤销，删除后数据将永久丢失！
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PostLists;
