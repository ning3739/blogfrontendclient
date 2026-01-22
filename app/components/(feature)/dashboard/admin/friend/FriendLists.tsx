"use client";

import { Edit, FileText, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useFormatter } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import UpdateFriendModal from "@/app/components/(feature)/dashboard/admin/friend/UpdateFriendModal";
import StatusBadge from "@/app/components/ui/badge/StatusBadge";
import ActionButton from "@/app/components/ui/button/ActionButton";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import FriendService from "@/app/lib/services/friendService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { OffsetPaginationResponse } from "@/app/types/commonType";
import type { GetFriendListItemsResponse } from "@/app/types/friendServiceType";
import { FriendType } from "@/app/types/friendServiceType";

interface FriendListsProps {
  friendItems: GetFriendListItemsResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void;
}

// 友链类型配置
const FRIEND_TYPE_CONFIG = {
  [FriendType.featured]: { label: "推荐站点", variant: "success" as const },
  [FriendType.normal]: { label: "普通友链", variant: "primary" as const },
  [FriendType.hidden]: { label: "隐藏", variant: "default" as const },
};

// 友链Logo组件
const FriendLogo = ({
  friend,
  size = "md",
}: {
  friend: GetFriendListItemsResponse;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = { sm: "w-12 h-12", md: "w-14 h-14", lg: "w-16 h-16" };
  const iconSizes = { sm: "w-5 h-5", md: "w-6 h-6", lg: "w-7 h-7" };

  return (
    <div
      className={`${sizeClasses[size]} rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0 cursor-pointer`}
    >
      {friend.logo_url ? (
        <Image
          src={friend.logo_url}
          alt={friend.chinese_title}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      ) : (
        <FileText className={`${iconSizes[size]} text-foreground-200`} />
      )}
    </div>
  );
};

// 友链信息组件
const FriendInfo = ({
  friend,
  showDescription = true,
}: {
  friend: GetFriendListItemsResponse;
  showDescription?: boolean;
}) => (
  <a
    href={friend.site_url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-start space-x-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
  >
    <FriendLogo friend={friend} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground-50 truncate cursor-pointer hover:text-primary-400 transition-colors">
        {friend.chinese_title}
      </p>
      {showDescription && friend.chinese_description && (
        <p className="text-xs text-foreground-300 truncate mt-0.5">{friend.chinese_description}</p>
      )}
    </div>
  </a>
);

// 友链操作按钮组
const FriendActions = ({
  onEdit,
  onDelete,
  isDeleting,
  size = "md",
}: {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  size?: "sm" | "md";
}) => (
  <>
    <ActionButton icon={Edit} onClick={onEdit} title="更新类型" variant="primary" size={size} />
    <ActionButton
      icon={Trash2}
      onClick={onDelete}
      title="删除友链"
      variant="error"
      size={size}
      disabled={isDeleting}
      loading={isDeleting}
    />
  </>
);

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
  const [editingFriend, setEditingFriend] = useState<GetFriendListItemsResponse | null>(null);

  useEffect(() => {
    setOptimisticFriends(friendItems);
  }, [friendItems]);

  const getFriendTypeConfig = (type: number) =>
    FRIEND_TYPE_CONFIG[type] || { label: "未知", variant: "default" as const };

  const handleEdit = (friend: GetFriendListItemsResponse) => {
    setEditingFriend(friend);
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    onDataChange?.();
    setIsEditModalOpen(false);
    setEditingFriend(null);
  };

  const handleDelete = async (friendId: number) => {
    if (deletingIds.includes(friendId)) return;
    setDeletingIds((prev) => [...prev, friendId]);
    setOptimisticFriends(optimisticFriends.filter((f) => f.id !== friendId));

    try {
      const response = await FriendService.deleteSingleFriend({ friend_list_id: friendId });
      if (response.status === 200) {
        toast.success("message" in response ? response.message : "Friend deleted");
        onDataChange?.();
      } else {
        toast.error("error" in response ? response.error : "Failed to delete friend");
        setOptimisticFriends(friendItems);
      }
    } catch (error) {
      console.error("Failed to delete friend:", error);
      toast.error("Failed to delete friend");
      setOptimisticFriends(friendItems);
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== friendId));
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-50">
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                友链信息
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                类型
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
            {optimisticFriends.map((friend, index) => {
              const typeConfig = getFriendTypeConfig(friend.type);
              return (
                <motion.tr
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                >
                  <td className="py-4 px-4">
                    <FriendInfo friend={friend} />
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge label={typeConfig.label} variant={typeConfig.variant} />
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-foreground-200">
                      {handleDateFormat(friend.created_at, format)}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end space-x-2">
                      <FriendActions
                        onEdit={() => handleEdit(friend)}
                        onDelete={() => handleDelete(friend.id)}
                        isDeleting={deletingIds.includes(friend.id)}
                      />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden space-y-3">
        {optimisticFriends.map((friend, index) => {
          const typeConfig = getFriendTypeConfig(friend.type);
          return (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="space-y-3">
                <FriendInfo friend={friend} />
                <div className="flex items-center justify-between">
                  <StatusBadge label={typeConfig.label} variant={typeConfig.variant} />
                  <p className="text-xs text-foreground-300">
                    {handleDateFormat(friend.created_at, format)}
                  </p>
                </div>
                <div className="flex justify-end space-x-1">
                  <FriendActions
                    onEdit={() => handleEdit(friend)}
                    onDelete={() => handleDelete(friend.id)}
                    isDeleting={deletingIds.includes(friend.id)}
                    size="sm"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {optimisticFriends.map((friend, index) => {
          const typeConfig = getFriendTypeConfig(friend.type);
          return (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="space-y-2.5">
                <FriendInfo friend={friend} showDescription={false} />
                <div className="flex items-center justify-between">
                  <StatusBadge label={typeConfig.label} variant={typeConfig.variant} size="xs" />
                  <p className="text-xs text-foreground-300">
                    {handleDateFormat(friend.created_at, format)}
                  </p>
                </div>
                <div className="flex justify-end space-x-1">
                  <FriendActions
                    onEdit={() => handleEdit(friend)}
                    onDelete={() => handleDelete(friend.id)}
                    isDeleting={deletingIds.includes(friend.id)}
                    size="sm"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {optimisticFriends.length > 0 && (
        <div className="mt-6">
          <OffsetPagination
            pagination={pagination}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {/* Update Friend Type Modal */}
      {editingFriend && (
        <UpdateFriendModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingFriend(null);
          }}
          onSuccess={handleUpdateSuccess}
          friendId={editingFriend.id}
          currentType={editingFriend.type}
        />
      )}
    </div>
  );
};

export default FriendLists;
