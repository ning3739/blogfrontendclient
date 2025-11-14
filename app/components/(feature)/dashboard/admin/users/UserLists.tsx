import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Trash2, Eye, UserCheck, UserX } from "lucide-react";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import UserListModel from "@/app/components/(feature)/dashboard/admin/users/userListModel";
import UserService from "@/app/lib/services/userService";
import type { UserResponse } from "@/app/types/userServiceType";
import type { OffsetPaginationResponse } from "@/app/types/commonType";

interface UserListsProps {
  userItems: UserResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void; // Optional callback for data refresh
}

const UserLists = ({
  userItems,
  pagination,
  setCurrentPage,
  onDataChange,
}: UserListsProps) => {
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [optimisticUsers, setOptimisticUsers] =
    useState<UserResponse[]>(userItems);

  // Update optimistic users when userItems prop changes
  useEffect(() => {
    setOptimisticUsers(userItems);
  }, [userItems]);

  const handleActionClick = async (action: string, userId: number) => {
    if (action === "view") {
      const user = optimisticUsers.find((u) => u.user_id === userId);
      if (user) {
        setSelectedUser(user);
        setIsModalOpen(true);
      }
    } else if (action === "toggle") {
      const user = optimisticUsers.find((u) => u.user_id === userId);
      if (!user) return;

      // Optimistic update - immediately update UI
      const newActiveState = !user.is_active;
      setOptimisticUsers(
        optimisticUsers.map((u) =>
          u.user_id === userId ? { ...u, is_active: newActiveState } : u
        )
      );

      try {
        // Call API in background
        await UserService.enableOrDisableUser({
          user_id: userId,
          is_active: newActiveState,
        });
      } catch {
        // Rollback on error
        setOptimisticUsers(
          optimisticUsers.map((u) =>
            u.user_id === userId ? { ...u, is_active: !newActiveState } : u
          )
        );
      }
    } else if (action === "delete") {
      // Optimistic update - immediately remove from UI
      setOptimisticUsers(optimisticUsers.filter((u) => u.user_id !== userId));

      try {
        // Call API in background
        await UserService.deleteUser({
          user_id: userId,
        });

        // Refresh list after successful delete to update pagination/total count
        if (onDataChange) {
          onDataChange();
        }
      } catch (error) {
        // Rollback on error
        console.error("Failed to delete user:", error);
        setOptimisticUsers(userItems);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
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
                  用户
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  邮箱
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  状态
                </th>
                <th className="text-right py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {optimisticUsers.map((user: UserResponse, index: number) => (
                <motion.tr
                  key={user.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                >
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={`${user.username} avatar`}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-foreground-100 text-xs lg:text-sm font-medium">
                            {user.username?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm font-medium text-foreground-50 truncate">
                          {user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <p className="text-xs lg:text-sm text-foreground-200 truncate max-w-[200px] lg:max-w-none">
                      {user.email}
                    </p>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-sm font-medium ${
                        user.is_active
                          ? "bg-success-50 text-success-500"
                          : "bg-error-50 text-error-500"
                      }`}
                    >
                      {user.is_active ? "活跃" : "非活跃"}
                    </span>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex justify-end space-x-1 lg:space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("view", user.user_id)}
                        className="p-1.5 lg:p-2 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>

                      {user.role.toLowerCase() !== "admin" && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleActionClick("toggle", user.user_id)
                            }
                            className={`p-1.5 lg:p-2 rounded-sm transition-colors ${
                              user.is_active
                                ? "bg-warning-50 text-warning-400 hover:bg-warning-100"
                                : "bg-success-50 text-success-400 hover:bg-success-100"
                            }`}
                            title={user.is_active ? "停用" : "启用"}
                          >
                            {user.is_active ? (
                              <UserX className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            )}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleActionClick("delete", user.user_id)
                            }
                            className="p-1.5 lg:p-2 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                            title="删除用户"
                          >
                            <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          </motion.button>
                        </>
                      )}
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
          {optimisticUsers.map((user: UserResponse, index: number) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={`${user.username} avatar`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-foreground-100 text-sm font-medium">
                        {user.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground-50 truncate">
                      {user.username}
                    </h3>
                    <p className="text-xs text-foreground-300 truncate ">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-sm font-medium ${
                        user.is_active
                          ? "bg-success-50 text-success-500"
                          : "bg-error-50 text-error-500"
                      }`}
                    >
                      {user.is_active ? "活跃" : "非活跃"}
                    </span>
                  </div>

                  <div className="flex space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleActionClick("view", user.user_id)}
                      className="p-1.5 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors"
                      title="查看详情"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </motion.button>

                    {user.role.toLowerCase() !== "admin" && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleActionClick("toggle", user.user_id)
                          }
                          className={`p-1.5 rounded-sm transition-colors ${
                            user.is_active
                              ? "bg-warning-50 text-warning-400 hover:bg-warning-100"
                              : "bg-success-50 text-success-400 hover:bg-success-100"
                          }`}
                          title={user.is_active ? "停用" : "启用"}
                        >
                          {user.is_active ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleActionClick("delete", user.user_id)
                          }
                          className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                          title="删除用户"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {optimisticUsers.map((user: UserResponse, index: number) => (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="space-y-2.5">
              {/* User Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={`${user.username} avatar`}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-foreground-100 text-xs font-medium">
                        {user.username?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground-50 truncate">
                      {user.username}
                    </h3>
                    <p className="text-xs text-foreground-300 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] rounded-sm font-medium shrink-0 ${
                    user.is_active
                      ? "bg-success-50 text-success-500"
                      : "bg-error-50 text-error-500"
                  }`}
                >
                  {user.is_active ? "活跃" : "非活跃"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end -mr-1">
                <div className="flex space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("view", user.user_id)}
                    className="p-1.5 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors active:bg-background-200"
                    title="查看详情"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </motion.button>

                  {user.role.toLowerCase() !== "admin" && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleActionClick("toggle", user.user_id)
                        }
                        className={`p-1.5 rounded-sm transition-colors ${
                          user.is_active
                            ? "bg-warning-50 text-warning-400 hover:bg-warning-100 active:bg-warning-100"
                            : "bg-success-50 text-success-400 hover:bg-success-100 active:bg-success-100"
                        }`}
                        title={user.is_active ? "停用" : "启用"}
                      >
                        {user.is_active ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleActionClick("delete", user.user_id)
                        }
                        className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors active:bg-error-100"
                        title="删除用户"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {optimisticUsers.length > 0 && (
        <div className="mt-6">
          <OffsetPagination
            pagination={pagination}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserListModel
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default UserLists;
