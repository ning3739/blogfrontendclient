"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Trash2, FileText, Edit } from "lucide-react";
import { useFormatter } from "next-intl";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import FriendService from "@/app/lib/services/friendService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { GetFriendListItemsResponse } from "@/app/types/friendServiceType";
import { FriendType } from "@/app/types/friendServiceType";
import type { OffsetPaginationResponse } from "@/app/types/commonType";
import UpdateFriendModel from "@/app/components/(feature)/dashboard/admin/friend/UpdateFriendModel";

interface FriendListsProps {
  friendItems: GetFriendListItemsResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void; // Optional callback for data refresh
}

const FriendLists = ({
  friendItems,
  pagination,
  setCurrentPage,
  onDataChange,
}: FriendListsProps) => {
  const format = useFormatter();
  const [optimisticFriends, setOptimisticFriends] =
    useState<GetFriendListItemsResponse[]>(friendItems);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] =
    useState<GetFriendListItemsResponse | null>(null);

  // Update optimistic friends when friendItems prop changes
  useEffect(() => {
    setOptimisticFriends(friendItems);
  }, [friendItems]);

  const handleEditType = (friend: GetFriendListItemsResponse) => {
    setEditingFriend(friend);
    setIsEditModalOpen(true);
  };

  const handleUpdateTypeSuccess = () => {
    // Refresh list after successful update
    if (onDataChange) {
      onDataChange();
    }
    setIsEditModalOpen(false);
    setEditingFriend(null);
  };

  const handleDelete = async (friendListId: number) => {
    if (deletingIds.includes(friendListId)) return;

    setDeletingIds((prev) => [...prev, friendListId]);

    // Optimistic update - immediately remove from UI
    setOptimisticFriends(
      optimisticFriends.filter((friend) => friend.id !== friendListId)
    );

    try {
      // Call API in background
      await FriendService.deleteSingleFriend({
        friend_list_id: friendListId,
      });

      // Refresh list after successful delete to update pagination/total count
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      // Rollback on error
      console.error("Failed to delete friend:", error);
      setOptimisticFriends(friendItems);
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== friendListId));
    }
  };

  const getFriendTypeLabel = (type: number): string => {
    switch (type) {
      case FriendType.featured:
        return "推荐站点";
      case FriendType.normal:
        return "普通友链";
      case FriendType.hidden:
        return "隐藏";
      default:
        return "未知";
    }
  };

  const getFriendTypeColor = (type: number): string => {
    switch (type) {
      case FriendType.featured:
        return "bg-success-50 text-success-500";
      case FriendType.normal:
        return "bg-primary-50 text-primary-500";
      case FriendType.hidden:
        return "bg-foreground-100 text-foreground-400";
      default:
        return "bg-foreground-100 text-foreground-400";
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
                  友链信息
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  类型
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
              {optimisticFriends.map(
                (friend: GetFriendListItemsResponse, index: number) => (
                  <motion.tr
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                  >
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <a
                        href={friend.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 lg:space-x-3 hover:opacity-80 transition-opacity"
                      >
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0 cursor-pointer">
                          {friend.logo_url ? (
                            <Image
                              src={friend.logo_url}
                              alt={friend.chinese_title}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-foreground-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs lg:text-sm font-medium text-foreground-50 truncate cursor-pointer hover:text-primary-400 transition-colors">
                            {friend.chinese_title}
                          </p>
                          {friend.chinese_description && (
                            <p className="text-xs text-foreground-300 truncate mt-0.5">
                              {friend.chinese_description}
                            </p>
                          )}
                        </div>
                      </a>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${getFriendTypeColor(
                          friend.type
                        )}`}
                      >
                        {getFriendTypeLabel(friend.type)}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <p className="text-xs lg:text-sm text-foreground-200">
                        {handleDateFormat(friend.created_at, format)}
                      </p>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4">
                      <div className="flex justify-end space-x-1 lg:space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditType(friend)}
                          className="p-1.5 lg:p-2 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                          title="更新类型"
                        >
                          <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(friend.id)}
                          disabled={deletingIds.includes(friend.id)}
                          className="p-1.5 lg:p-2 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors disabled:opacity-50"
                          title="删除友链"
                        >
                          <Trash2
                            className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${
                              deletingIds.includes(friend.id)
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
          {optimisticFriends.map(
            (friend: GetFriendListItemsResponse, index: number) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
              >
                <div className="space-y-3">
                  <a
                    href={friend.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start space-x-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-16 h-16 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0 cursor-pointer">
                      {friend.logo_url ? (
                        <Image
                          src={friend.logo_url}
                          alt={friend.chinese_title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-7 h-7 text-foreground-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground-50 truncate cursor-pointer hover:text-primary-400 transition-colors">
                        {friend.chinese_title}
                      </h3>
                      {friend.chinese_description && (
                        <p className="text-xs text-foreground-300 mt-1 line-clamp-2">
                          {friend.chinese_description}
                        </p>
                      )}
                    </div>
                  </a>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${getFriendTypeColor(
                          friend.type
                        )}`}
                      >
                        {getFriendTypeLabel(friend.type)}
                      </span>
                      <p className="text-xs text-foreground-300">
                        {handleDateFormat(friend.created_at, format)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditType(friend)}
                      className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                      title="更新类型"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(friend.id)}
                      disabled={deletingIds.includes(friend.id)}
                      className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors disabled:opacity-50"
                      title="删除友链"
                    >
                      <Trash2
                        className={`w-3.5 h-3.5 ${
                          deletingIds.includes(friend.id) ? "animate-spin" : ""
                        }`}
                      />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {optimisticFriends.map(
          (friend: GetFriendListItemsResponse, index: number) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="space-y-2.5">
                {/* Friend Header */}
                <a
                  href={friend.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-2.5 hover:opacity-80 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0 cursor-pointer">
                    {friend.logo_url ? (
                      <Image
                        src={friend.logo_url}
                        alt={friend.chinese_title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-foreground-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground-50 truncate cursor-pointer hover:text-primary-400 transition-colors">
                      {friend.chinese_title}
                    </h3>
                    {friend.chinese_description && (
                      <p className="text-xs text-foreground-300 line-clamp-2 mt-0.5">
                        {friend.chinese_description}
                      </p>
                    )}
                  </div>
                </a>

                {/* Friend Meta */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${getFriendTypeColor(
                        friend.type
                      )}`}
                    >
                      {getFriendTypeLabel(friend.type)}
                    </span>
                    <p className="text-xs text-foreground-300">
                      {handleDateFormat(friend.created_at, format)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end -mr-1">
                  <div className="flex space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditType(friend)}
                      className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors active:bg-warning-100"
                      title="更新类型"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(friend.id)}
                      disabled={deletingIds.includes(friend.id)}
                      className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors active:bg-error-100 disabled:opacity-50"
                      title="删除友链"
                    >
                      <Trash2
                        className={`w-3.5 h-3.5 ${
                          deletingIds.includes(friend.id) ? "animate-spin" : ""
                        }`}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>

      {/* Pagination */}
      {optimisticFriends.length > 0 && (
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

      {/* Update Friend Type Modal */}
      {editingFriend && (
        <UpdateFriendModel
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingFriend(null);
          }}
          onSuccess={handleUpdateTypeSuccess}
          friendId={editingFriend.id}
          currentType={editingFriend.type}
        />
      )}
    </div>
  );
};

export default FriendLists;
