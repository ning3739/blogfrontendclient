import React from "react";
import {
  User,
  Shield,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Modal from "@/app/components/ui/modal/Modal";
import type { UserResponse } from "@/app/types/userServiceType";

interface UserListModelProps {
  user: UserResponse;
  isOpen: boolean;
  onClose: () => void;
}

const UserListModel = ({ user, isOpen, onClose }: UserListModelProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="用户详情"
      size="lg"
      maxHeight="max-h-[90vh]"
    >
      {/* User Info */}
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-sm bg-background-50">
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-background-100 bg-opacity-20"></div>
          </div>

          <div className="relative p-6">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden bg-card-50 shadow-lg ring-2 ring-border-100">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={`${user.username} avatar`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-background-200 flex items-center justify-center">
                    <span className="text-foreground-50 text-xl font-bold">
                      {user.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-foreground-50 truncate">
                  {user.username}
                </h3>
                <p className="text-sm text-foreground-300 truncate mb-2">
                  {user.email}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-sm bg-background-200 text-foreground-100">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className="space-y-4">
          {/* Bio Section */}
          {user.bio && (
            <div className="bg-card-50 border border-border-50 rounded-sm p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-sm bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-primary-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground-100">
                    关于
                  </h4>
                  <p className="text-sm text-foreground-300 leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Location & Account Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Card */}
            {(user.city ||
              user.latitude ||
              user.longitude ||
              user.ip_address) && (
              <div className="bg-card-50 border border-border-50 rounded-sm p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 rounded-sm bg-success-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-success-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground-100">
                    位置信息
                  </h4>
                </div>
                <div className="space-y-2">
                  {user.city && (
                    <div className="flex justify-between">
                      <span className="text-xs text-foreground-400">城市</span>
                      <span className="text-sm text-foreground-300 font-medium">
                        {user.city}
                      </span>
                    </div>
                  )}
                  {user.latitude && user.longitude && (
                    <div className="flex justify-between">
                      <span className="text-xs text-foreground-400">坐标</span>
                      <span className="text-sm text-foreground-300 font-mono">
                        {user.latitude}, {user.longitude}
                      </span>
                    </div>
                  )}
                  {user.ip_address && (
                    <div className="flex justify-between">
                      <span className="text-xs text-foreground-400">
                        IP 地址
                      </span>
                      <span className="text-sm text-foreground-300 font-mono">
                        {user.ip_address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Card */}
            <div className="bg-card-50 border border-border-50 rounded-sm p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-sm bg-info-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-info-500" />
                </div>
                <h4 className="text-sm font-semibold text-foreground-100">
                  账户信息
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-foreground-400">用户 ID</span>
                  <span className="text-sm text-foreground-300 font-mono">
                    #{user.user_id}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-foreground-400">
                      账户状态
                    </span>
                    <div className="flex items-center space-x-1">
                      {user.is_deleted ? (
                        <XCircle className="w-3 h-3 text-error-500" />
                      ) : (
                        <CheckCircle className="w-3 h-3 text-success-500" />
                      )}
                      <span className="text-sm text-foreground-300 font-medium">
                        {user.is_deleted ? "已删除" : "活跃"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-foreground-400">
                      验证状态
                    </span>
                    <div className="flex items-center space-x-1">
                      {user.is_verified ? (
                        <CheckCircle className="w-3 h-3 text-success-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-warning-500" />
                      )}
                      <span className="text-sm text-foreground-300 font-medium">
                        {user.is_verified ? "已验证" : "未验证"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card-50 border border-border-50 rounded-sm p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-sm bg-warning-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-warning-500" />
              </div>
              <h4 className="text-sm font-semibold text-foreground-100">
                时间线
              </h4>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border-100"></div>

              <div className="space-y-4">
                {user.created_at && (
                  <div className="relative flex items-start space-x-3">
                    <div className="relative z-10 w-2 h-2 bg-success-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-xs text-foreground-400 font-medium">
                        账户创建
                      </p>
                      <p className="text-sm text-foreground-300">
                        {new Date(user.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {user.updated_at && (
                  <div className="relative flex items-start space-x-3">
                    <div className="relative z-10 w-2 h-2 bg-background-300 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-xs text-foreground-400 font-medium">
                        最后更新
                      </p>
                      <p className="text-sm text-foreground-300">
                        {new Date(user.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserListModel;
