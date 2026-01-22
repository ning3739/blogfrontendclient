import { BarChart3, Bookmark, Eye, Heart, MessageCircle, Tag } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import BaseModal from "@/app/components/ui/modal/BaseModal";
import type { BlogItemDashboardResponse } from "@/app/types/blogServiceType";

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogData: BlogItemDashboardResponse | null;
}

const PostDetailModal = ({ isOpen, onClose, blogData }: PostDetailModalProps) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="文章信息"
      size="md"
      maxHeight="max-h-[90vh]"
    >
      {blogData && (
        <div className="space-y-6">
          {/* Post Header */}
          <div className="relative overflow-hidden rounded-sm bg-background-50">
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-background-100 bg-opacity-20"></div>
            </div>

            <div className="relative p-6">
              <div className="flex items-center space-x-4">
                {/* Cover Image */}
                <div className="w-16 h-16 rounded-sm overflow-hidden bg-card-50 shadow-lg ring-2 ring-border-100">
                  {blogData.cover_url ? (
                    <Image
                      src={blogData.cover_url}
                      alt={`${blogData.blog_title} cover`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-background-200 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-primary-500" />
                    </div>
                  )}
                </div>

                {/* Post Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground-50 truncate">
                    {blogData.blog_title}
                  </h3>
                  <p className="text-sm text-foreground-300 truncate mb-2">
                    {blogData.blog_description || "暂无描述"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Blog Tags */}
          <div className="bg-card-50 border border-border-50 rounded-sm p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-sm bg-primary-50 flex items-center justify-center">
                <Tag className="w-4 h-4 text-primary-500" />
              </div>
              <h4 className="text-sm font-semibold text-foreground-100">标签</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {blogData.blog_tags && blogData.blog_tags.length > 0 ? (
                blogData.blog_tags.map(
                  (tag: { tag_id: number; tag_title: string }, index: number) => (
                    <motion.span
                      key={tag.tag_id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-3 py-1.5 bg-background-100 text-foreground-100 text-xs font-medium rounded-sm border border-border-50"
                    >
                      {tag.tag_title}
                    </motion.span>
                  ),
                )
              ) : (
                <span className="text-sm text-foreground-300 italic">暂无标签</span>
              )}
            </div>
          </div>

          {/* Blog Stats */}
          <div className="bg-card-50 border border-border-50 rounded-sm p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-info-50 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-info-500" />
              </div>
              <h4 className="text-sm font-semibold text-foreground-100">统计信息</h4>
            </div>
            <div className="space-y-3">
              {/* Views */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between p-3 bg-background-100 rounded-sm hover:bg-background-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-sm bg-info-50 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-info-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground-100">浏览量</span>
                </div>
                <span className="text-lg font-bold text-foreground-50">
                  {blogData.blog_stats?.views || 0}
                </span>
              </motion.div>

              {/* Likes */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between p-3 bg-background-100 rounded-sm hover:bg-background-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-sm bg-error-50 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-error-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground-100">点赞数</span>
                </div>
                <span className="text-lg font-bold text-foreground-50">
                  {blogData.blog_stats?.likes || 0}
                </span>
              </motion.div>

              {/* Comments */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between p-3 bg-background-100 rounded-sm hover:bg-background-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-sm bg-success-50 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-success-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground-100">评论数</span>
                </div>
                <span className="text-lg font-bold text-foreground-50">
                  {blogData.blog_stats?.comments || 0}
                </span>
              </motion.div>

              {/* Saves */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between p-3 bg-background-100 rounded-sm hover:bg-background-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-sm bg-warning-50 flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-warning-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground-100">收藏数</span>
                </div>
                <span className="text-lg font-bold text-foreground-50">
                  {blogData.blog_stats?.saves || 0}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
};

export default PostDetailModal;
