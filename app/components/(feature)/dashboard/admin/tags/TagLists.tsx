"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trash2, Edit } from "lucide-react";
import { useLocale, useFormatter } from "next-intl";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import CreateTagModal from "@/app/components/(feature)/editor/CreateTagModal";
import TagService from "@/app/lib/services/tagService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { GetTagItemResponse } from "@/app/types/tagServiceType";
import type { OffsetPaginationResponse } from "@/app/types/commonType";

interface TagListsProps {
  tagItems: GetTagItemResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void; // Optional callback for data refresh
}

const TagLists = ({
  tagItems,
  pagination,
  setCurrentPage,
  onDataChange,
}: TagListsProps) => {
  const locale = useLocale();
  const format = useFormatter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<GetTagItemResponse | null>(null);
  const [optimisticTagItems, setOptimisticTagItems] =
    useState<GetTagItemResponse[]>(tagItems);

  // Update optimistic tag items when tagItems prop changes
  useEffect(() => {
    setOptimisticTagItems(tagItems);
  }, [tagItems]);

  const handleActionClick = async (action: string, tagId: number) => {
    if (action === "edit") {
      const tagItem = optimisticTagItems.find((t) => t.tag_id === tagId);
      if (tagItem) {
        setEditingTag(tagItem);
        setIsEditModalOpen(true);
      }
    } else if (action === "delete") {
      // Optimistic update - immediately remove from UI
      setOptimisticTagItems(
        optimisticTagItems.filter((t) => t.tag_id !== tagId)
      );

      try {
        // Call API in background
        await TagService.deleteTag({
          tag_id: tagId,
        });

        // Refresh list after successful delete to update pagination/total count
        if (onDataChange) {
          onDataChange();
        }
      } catch (error) {
        // Rollback on error
        console.error("Failed to delete tag item:", error);
        setOptimisticTagItems(tagItems);
      }
    }
  };

  const handleEditTagSuccess = () => {
    // Refresh the data after successful edit
    if (onDataChange) {
      onDataChange();
    }
    setIsEditModalOpen(false);
    setEditingTag(null);
  };

  return (
    <div className="w-full">
      {/* 桌面表格视图 */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-50">
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  标签名称
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  创建时间
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  更新时间
                </th>
                <th className="text-right py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {optimisticTagItems.map(
                (tagItem: GetTagItemResponse, index: number) => (
                  <motion.tr
                    key={tagItem.tag_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                  >
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm font-medium text-foreground-50 truncate">
                          {tagItem.title}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <p className="text-xs lg:text-sm text-foreground-200">
                        {handleDateFormat(tagItem.created_at, format)}
                      </p>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <p className="text-xs lg:text-sm text-foreground-200">
                        {tagItem.updated_at
                          ? handleDateFormat(tagItem.updated_at, format)
                          : "-"}
                      </p>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <div className="flex justify-end space-x-1 lg:space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleActionClick("edit", tagItem.tag_id)
                          }
                          className="p-1.5 lg:p-2 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                          title="编辑标签"
                        >
                          <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleActionClick("delete", tagItem.tag_id)
                          }
                          className="p-1.5 lg:p-2 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                          title="删除标签"
                        >
                          <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
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

      {/* 平板视图 */}
      <div className="hidden md:block lg:hidden">
        <div className="space-y-3">
          {optimisticTagItems.map(
            (tagItem: GetTagItemResponse, index: number) => (
              <motion.div
                key={tagItem.tag_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground-50 truncate flex-1">
                      {tagItem.title}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-foreground-300">
                      创建时间: {handleDateFormat(tagItem.created_at, format)}
                    </p>
                    <p className="text-xs text-foreground-400">
                      更新时间:{" "}
                      {tagItem.updated_at
                        ? handleDateFormat(tagItem.updated_at, format)
                        : "-"}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActionClick("edit", tagItem.tag_id)}
                      className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                      title="编辑标签"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleActionClick("delete", tagItem.tag_id)
                      }
                      className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                      title="删除标签"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>

      {/* 移动端卡片视图 */}
      <div className="md:hidden space-y-3">
        {optimisticTagItems.map(
          (tagItem: GetTagItemResponse, index: number) => (
            <motion.div
              key={tagItem.tag_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="space-y-2.5">
                {/* 标签头部 */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground-50 truncate flex-1">
                    {tagItem.title}
                  </h3>
                </div>

                {/* 时间信息 */}
                <div className="space-y-1">
                  <p className="text-xs text-foreground-300">
                    创建: {handleDateFormat(tagItem.created_at, format)}
                  </p>
                  <p className="text-xs text-foreground-400">
                    更新:{" "}
                    {tagItem.updated_at
                      ? handleDateFormat(tagItem.updated_at, format)
                      : "-"}
                  </p>
                </div>

                {/* 操作 */}
                <div className="flex justify-end -mr-1">
                  <div className="flex space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActionClick("edit", tagItem.tag_id)}
                      className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors active:bg-primary-100"
                      title="编辑标签"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleActionClick("delete", tagItem.tag_id)
                      }
                      className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors active:bg-error-100"
                      title="删除标签"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>

      {/* 分页 */}
      {optimisticTagItems.length > 0 && (
        <div className="mt-6">
          <OffsetPagination
            pagination={pagination}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        </div>
      )}

      {/* 编辑标签模态框 */}
      {editingTag && (
        <CreateTagModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTag(null);
          }}
          onSuccess={handleEditTagSuccess}
          initialData={{
            chinese_title: editingTag.title,
          }}
          tagId={editingTag.tag_id}
        />
      )}
    </div>
  );
};

export default TagLists;
