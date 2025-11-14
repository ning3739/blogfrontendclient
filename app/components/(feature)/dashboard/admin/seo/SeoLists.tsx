"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trash2, Edit } from "lucide-react";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import CreateSeoModal from "@/app/components/(feature)/editor/CreateSeoModal";
import SeoService from "@/app/lib/services/seoService";
import type { GetSeoItemResponse } from "@/app/types/seoServiceType";
import type { OffsetPaginationResponse } from "@/app/types/commonType";

interface SeoListsProps {
  seoItems: GetSeoItemResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void; // Optional callback for data refresh
}

const SeoLists = ({
  seoItems,
  pagination,
  setCurrentPage,
  onDataChange,
}: SeoListsProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSeo, setEditingSeo] = useState<GetSeoItemResponse | null>(null);
  const [optimisticSeoItems, setOptimisticSeoItems] =
    useState<GetSeoItemResponse[]>(seoItems);

  // Update optimistic seo items when seoItems prop changes
  useEffect(() => {
    setOptimisticSeoItems(seoItems);
  }, [seoItems]);

  const handleActionClick = async (action: string, seoId: number) => {
    if (action === "edit") {
      const seoItem = optimisticSeoItems.find((s) => s.seo_id === seoId);
      if (seoItem) {
        setEditingSeo(seoItem);
        setIsEditModalOpen(true);
      }
    } else if (action === "delete") {
      // Optimistic update - immediately remove from UI
      setOptimisticSeoItems(
        optimisticSeoItems.filter((s) => s.seo_id !== seoId)
      );

      try {
        // Call API in background
        await SeoService.deleteSeo({
          seo_id: seoId,
        });

        // Refresh list after successful delete to update pagination/total count
        if (onDataChange) {
          onDataChange();
        }
      } catch (error) {
        // Rollback on error
        console.error("Failed to delete SEO item:", error);
        setOptimisticSeoItems(seoItems);
      }
    }
  };

  const handleEditSeoSuccess = () => {
    // Refresh the data after successful edit
    if (onDataChange) {
      onDataChange();
    }
    setIsEditModalOpen(false);
    setEditingSeo(null);
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
                  标题
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  描述
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  关键词
                </th>
                <th className="text-right py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {optimisticSeoItems.map(
                (seoItem: GetSeoItemResponse, index: number) => (
                  <motion.tr
                    key={seoItem.seo_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                  >
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm font-medium text-foreground-50 truncate">
                          {seoItem.title}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <p className="text-xs lg:text-sm text-foreground-200 truncate max-w-[200px] lg:max-w-[300px]">
                        {seoItem.description}
                      </p>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <p className="text-xs lg:text-sm text-foreground-200 truncate max-w-[150px] lg:max-w-[200px]">
                        {seoItem.keywords}
                      </p>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <div className="flex justify-end space-x-1 lg:space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleActionClick("edit", seoItem.seo_id)
                          }
                          className="p-1.5 lg:p-2 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                          title="编辑 SEO 项目"
                        >
                          <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleActionClick("delete", seoItem.seo_id)
                          }
                          className="p-1.5 lg:p-2 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                          title="删除 SEO 项目"
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
          {optimisticSeoItems.map(
            (seoItem: GetSeoItemResponse, index: number) => (
              <motion.div
                key={seoItem.seo_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground-50 truncate flex-1">
                      {seoItem.title}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-foreground-300 line-clamp-2">
                      {seoItem.description}
                    </p>
                    <p className="text-xs text-foreground-400 truncate">
                      关键词: {seoItem.keywords}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActionClick("edit", seoItem.seo_id)}
                      className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                      title="编辑 SEO 项目"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleActionClick("delete", seoItem.seo_id)
                      }
                      className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                      title="删除 SEO 项目"
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
        {optimisticSeoItems.map(
          (seoItem: GetSeoItemResponse, index: number) => (
            <motion.div
              key={seoItem.seo_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="space-y-2.5">
                {/* SEO 头部 */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground-50 truncate flex-1">
                    {seoItem.title}
                  </h3>
                </div>

                {/* 描述 */}
                <p className="text-xs text-foreground-300 line-clamp-2">
                  {seoItem.description}
                </p>

                {/* 关键词 */}
                <p className="text-xs text-foreground-400 truncate">
                  关键词: {seoItem.keywords}
                </p>

                {/* 操作 */}
                <div className="flex justify-end -mr-1">
                  <div className="flex space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActionClick("edit", seoItem.seo_id)}
                      className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors active:bg-primary-100"
                      title="编辑 SEO 项目"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleActionClick("delete", seoItem.seo_id)
                      }
                      className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors active:bg-error-100"
                      title="删除 SEO 项目"
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
      {optimisticSeoItems.length > 0 && (
        <div className="mt-6">
          <OffsetPagination
            pagination={pagination}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        </div>
      )}

      {/* 编辑 SEO 模态框 */}
      {editingSeo && (
        <CreateSeoModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSeo(null);
          }}
          onSuccess={handleEditSeoSuccess}
          initialData={{
            chinese_title: editingSeo.title,
            chinese_description: editingSeo.description,
            chinese_keywords: editingSeo.keywords,
          }}
          seoId={editingSeo.seo_id}
        />
      )}
    </div>
  );
};

export default SeoLists;
