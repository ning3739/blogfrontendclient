"use client";

import { Eye, Trash2, UserCheck, UserX } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import UserDetailModal from "@/app/components/(feature)/dashboard/admin/users/UserDetailModal";
import StatusBadge from "@/app/components/ui/badge/StatusBadge";
import ActionButton from "@/app/components/ui/button/ActionButton";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import UserService from "@/app/lib/services/userService";
import type { OffsetPaginationResponse } from "@/app/types/commonType";
import type { UserResponse } from "@/app/types/userServiceType";

interface UserListsProps {
  userItems: UserResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void;
}

// 用户头像组件
const UserAvatarCell = ({ user, size = "md" }: { user: UserResponse; size?: "sm" | "md" }) => {
  const sizeClasses = size === "sm" ? "w-9 h-9" : "w-8 h-8 lg:w-10 lg:h-10";
  const textSize = size === "sm" ? "text-xs" : "text-xs lg:text-sm";

  return (
    <div
      className={`${sizeClasses} rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0`}
    >
      {user.avatar_url ? (
        <Image
          src={user.avatar_url}
          alt={`${user.username} avatar`}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`text-foreground-100 ${textSize} font-medium`}>
          {user.username?.charAt(0)?.toUpperCase() || "U"}
        </span>
      )}
    </div>
  );
};

// 用户操作按钮组
const UserActions = ({
  user,
  onView,
  onToggle,
  onDelete,
  size = "md",
}: {
  user: UserResponse;
  onView: () => void;
  onToggle: () => void;
  onDelete: () => void;
  size?: "sm" | "md";
}) => {
  const isAdmin = user.role.toLowerCase() === "admin";

  return (
    <>
      <ActionButton icon={Eye} onClick={onView} title="查看详情" variant="default" size={size} />
      {!isAdmin && (
        <>
          <ActionButton
            icon={user.is_active ? UserX : UserCheck}
            onClick={onToggle}
            title={user.is_active ? "停用" : "启用"}
            variant={user.is_active ? "warning" : "success"}
            size={size}
          />
          <ActionButton
            icon={Trash2}
            onClick={onDelete}
            title="删除用户"
            variant="error"
            size={size}
          />
        </>
      )}
    </>
  );
};

const UserLists = ({ userItems, pagination, setCurrentPage, onDataChange }: UserListsProps) => {
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [optimisticUsers, setOptimisticUsers] = useState<UserResponse[]>(userItems);

  useEffect(() => {
    setOptimisticUsers(userItems);
  }, [userItems]);

  const handleView = (user: UserResponse) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleToggle = async (user: UserResponse) => {
    const newActiveState = !user.is_active;
    setOptimisticUsers(
      optimisticUsers.map((u) =>
        u.user_id === user.user_id ? { ...u, is_active: newActiveState } : u,
      ),
    );

    try {
      const response = await UserService.enableOrDisableUser({
        user_id: user.user_id,
        is_active: newActiveState,
      });
      if (response.status === 200) {
        toast.success("message" in response ? response.message : "User status updated");
      } else {
        toast.error("error" in response ? response.error : "Failed to update user status");
        setOptimisticUsers(
          optimisticUsers.map((u) =>
            u.user_id === user.user_id ? { ...u, is_active: !newActiveState } : u,
          ),
        );
      }
    } catch {
      toast.error("Failed to update user status");
      setOptimisticUsers(
        optimisticUsers.map((u) =>
          u.user_id === user.user_id ? { ...u, is_active: !newActiveState } : u,
        ),
      );
    }
  };

  const handleDelete = async (userId: number) => {
    setOptimisticUsers(optimisticUsers.filter((u) => u.user_id !== userId));
    try {
      const response = await UserService.deleteUser({ user_id: userId });
      if (response.status === 200) {
        toast.success("message" in response ? response.message : "User deleted");
        onDataChange?.();
      } else {
        toast.error("error" in response ? response.error : "Failed to delete user");
        setOptimisticUsers(userItems);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
      setOptimisticUsers(userItems);
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
                用户
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                邮箱
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                状态
              </th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-foreground-200">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {optimisticUsers.map((user, index) => (
              <motion.tr
                key={user.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <UserAvatarCell user={user} />
                    <p className="text-sm font-medium text-foreground-50 truncate">
                      {user.username}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-foreground-200 truncate max-w-[200px] lg:max-w-none">
                    {user.email}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <StatusBadge
                    label={user.is_active ? "活跃" : "非活跃"}
                    variant={user.is_active ? "success" : "error"}
                  />
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-end space-x-2">
                    <UserActions
                      user={user}
                      onView={() => handleView(user)}
                      onToggle={() => handleToggle(user)}
                      onDelete={() => handleDelete(user.user_id)}
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
        {optimisticUsers.map((user, index) => (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <UserAvatarCell user={user} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-foreground-50 truncate">
                    {user.username}
                  </h3>
                  <p className="text-xs text-foreground-300 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge
                  label={user.is_active ? "活跃" : "非活跃"}
                  variant={user.is_active ? "success" : "error"}
                />
                <div className="flex space-x-1">
                  <UserActions
                    user={user}
                    onView={() => handleView(user)}
                    onToggle={() => handleToggle(user)}
                    onDelete={() => handleDelete(user.user_id)}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {optimisticUsers.map((user, index) => (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <UserAvatarCell user={user} size="sm" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground-50 truncate">
                      {user.username}
                    </h3>
                    <p className="text-xs text-foreground-300 truncate">{user.email}</p>
                  </div>
                </div>
                <StatusBadge
                  label={user.is_active ? "活跃" : "非活跃"}
                  variant={user.is_active ? "success" : "error"}
                  size="xs"
                />
              </div>
              <div className="flex justify-end">
                <div className="flex space-x-1">
                  <UserActions
                    user={user}
                    onView={() => handleView(user)}
                    onToggle={() => handleToggle(user)}
                    onDelete={() => handleDelete(user.user_id)}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {optimisticUsers.length > 0 && (
        <div className="mt-6">
          <OffsetPagination pagination={pagination} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserLists;
