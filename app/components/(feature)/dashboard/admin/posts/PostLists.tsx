"use client";

import { FileText } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormatter } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PostActionButtons from "@/app/components/(feature)/dashboard/admin/posts/PostActionButtons";
import PostDetailModal from "@/app/components/(feature)/dashboard/admin/posts/PostDetailModal";
import PostStatusBadges from "@/app/components/(feature)/dashboard/admin/posts/PostStatusBadges";
import DeleteConfirmModal from "@/app/components/ui/modal/DeleteConfirmModal";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import BlogService from "@/app/lib/services/blogService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { BlogItemDashboardResponse } from "@/app/types/blogServiceType";
import type { OffsetPaginationResponse } from "@/app/types/commonType";

interface PostListsProps {
  postItems: BlogItemDashboardResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void;
}

const PostLists = ({ postItems, pagination, setCurrentPage, onDataChange }: PostListsProps) => {
  const format = useFormatter();
  const router = useRouter();
  const [optimisticPosts, setOptimisticPosts] = useState<BlogItemDashboardResponse[]>(postItems);
  const [blogInfoModel, setBlogInfoModel] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogItemDashboardResponse | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogItemDashboardResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setOptimisticPosts(postItems);
  }, [postItems]);

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await BlogService.deleteBlog({ blog_id: blogToDelete.blog_id });

      if (response.status === 200) {
        setOptimisticPosts((prev) => prev.filter((p) => p.blog_slug !== blogToDelete.blog_slug));
        toast.success("message" in response ? response.message : "文章删除成功");
        setDeleteConfirmModal(false);
        setBlogToDelete(null);
        onDataChange?.();
      } else {
        setDeleteError("error" in response ? response.error : "删除文章失败");
      }
    } catch (err) {
      const error = err as { error?: string };
      setDeleteError(error.error || "删除文章失败，请稍后重试");
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
    if (!post) return;

    switch (action) {
      case "view":
        router.push(`/dashboard/preview/?blogSlug=${blogSlug}&type=blog`);
        break;
      case "title_click":
        router.push(
          post.is_published
            ? `/${post.section_slug}/${blogSlug}`
            : `/dashboard/preview/?blogSlug=${blogSlug}&type=blog`,
        );
        break;
      case "info":
        setSelectedBlog(post);
        setBlogInfoModel(true);
        break;
      case "edit":
        router.push(`/dashboard/editor/?blogSlug=${blogSlug}&type=update`);
        break;
      case "delete":
        setBlogToDelete(post);
        setDeleteConfirmModal(true);
        break;
      case "status_update":
        if (statusType && newValue !== undefined) {
          setOptimisticPosts((prev) =>
            prev.map((p) => (p.blog_slug === blogSlug ? { ...p, [statusType]: newValue } : p)),
          );
          try {
            const response = await BlogService.updateBlogStatus({
              blog_id: post.blog_id,
              [statusType]: newValue,
            });
            if (response.status === 200) {
              toast.success("message" in response ? response.message : "状态更新成功");
              onDataChange?.();
            } else {
              toast.error("error" in response ? response.error : "状态更新失败");
              setOptimisticPosts(postItems);
            }
          } catch {
            toast.error("状态更新失败");
            setOptimisticPosts(postItems);
          }
        }
        break;
    }
  };

  // Post item component for reuse
  const PostItem = ({ post }: { post: BlogItemDashboardResponse }) => (
    <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.blog_title}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-foreground-200" />
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
  );

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-50">
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                文章
              </th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-foreground-200">
                状态
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                创建时间
              </th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-foreground-200">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {optimisticPosts.map((post, index) => (
              <motion.tr
                key={post.blog_slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
              >
                <td className="py-4 px-4">
                  <PostItem post={post} />
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-center space-x-1">
                    <PostStatusBadges
                      isPublished={post.is_published}
                      isArchived={post.is_archived}
                      isFeatured={post.is_featured}
                    />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-foreground-200">
                    {handleDateFormat(post.created_at, format)}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-end space-x-2">
                    <PostActionButtons
                      blogSlug={post.blog_slug}
                      isPublished={post.is_published}
                      isArchived={post.is_archived}
                      isFeatured={post.is_featured}
                      onAction={handleActionClick}
                      size="md"
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden space-y-3">
        {optimisticPosts.map((post, index) => (
          <motion.div
            key={post.blog_slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <PostItem post={post} />
              </div>
              <div className="flex space-x-1">
                <PostActionButtons
                  blogSlug={post.blog_slug}
                  isPublished={post.is_published}
                  isArchived={post.is_archived}
                  isFeatured={post.is_featured}
                  onAction={handleActionClick}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 ml-14">
              <span className="text-xs text-foreground-300">
                {handleDateFormat(post.created_at, format)}
              </span>
              <PostStatusBadges
                isPublished={post.is_published}
                isArchived={post.is_archived}
                isFeatured={post.is_featured}
                size="xs"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {optimisticPosts.map((post, index) => (
          <motion.div
            key={post.blog_slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="space-y-2.5">
              <PostItem post={post} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <PostStatusBadges
                    isPublished={post.is_published}
                    isArchived={post.is_archived}
                    isFeatured={post.is_featured}
                    size="xs"
                  />
                </div>
                <span className="text-xs text-foreground-300">
                  {handleDateFormat(post.created_at, format)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <PostActionButtons
                  blogSlug={post.blog_slug}
                  isPublished={post.is_published}
                  isArchived={post.is_archived}
                  isFeatured={post.is_featured}
                  onAction={handleActionClick}
                  showLabels
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {optimisticPosts.length > 0 && (
        <div className="mt-6">
          <OffsetPagination pagination={pagination} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Modals */}
      <PostDetailModal
        isOpen={blogInfoModel}
        onClose={() => {
          setBlogInfoModel(false);
          setSelectedBlog(null);
        }}
        blogData={selectedBlog}
      />
      <DeleteConfirmModal
        isOpen={deleteConfirmModal}
        onClose={() => {
          setDeleteConfirmModal(false);
          setBlogToDelete(null);
          setDeleteError("");
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        error={deleteError}
        itemTitle={blogToDelete?.blog_title || ""}
      />
    </div>
  );
};

export default PostLists;
