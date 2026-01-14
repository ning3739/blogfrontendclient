"use client";

import { CheckCircle, Clock, Map as MapIcon, MapPin, Network, User, XCircle } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import useSWR from "swr";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import userService from "@/app/lib/services/userService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { UserResponse } from "@/app/types/userServiceType";

export default function UserPage() {
  const params = useParams();
  const id = params?.id as string;
  const userId = id ? parseInt(id, 10) : null;
  const format = useFormatter();
  const commonT = useTranslations("common");

  const {
    data: userProfileResponse,
    isLoading,
    error,
  } = useSWR<UserResponse>(
    userId && !Number.isNaN(userId) ? `user/other/get-other-user-profile/${userId}` : null,
    async (): Promise<UserResponse> => {
      if (!userId || Number.isNaN(userId)) {
        throw new Error("Invalid user ID");
      }
      const response = await userService.getOtherUserProfile({
        user_id: userId,
      });
      if ("data" in response && response.data) {
        return response.data as UserResponse;
      }
      throw new Error("Failed to fetch user profile");
    },
    {
      revalidateOnFocus: false,
    },
  );

  if (!id || !userId || Number.isNaN(userId)) {
    return (
      <ErrorDisplay
        title={commonT("notFound")}
        message={commonT("notFoundMessage")}
        type="notFound"
        showReload={false}
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingSpinner message={commonT("loading")} size="md" variant="wave" fullScreen={true} />
    );
  }

  if (error) {
    if (error.status === 404) {
      return (
        <ErrorDisplay
          title={commonT("notFound")}
          message={commonT("notFoundMessage")}
          type="notFound"
          showReload={false}
        />
      );
    }

    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
      />
    );
  }

  if (!userProfileResponse) {
    return (
      <ErrorDisplay
        title={commonT("notFound")}
        message={commonT("notFoundMessage")}
        type="notFound"
        showReload={false}
      />
    );
  }

  const userProfile = userProfileResponse;

  // Stats data configuration
  const statsData = [
    {
      title: "账户状态",
      value: userProfile.is_deleted ? "已删除" : "活跃",
      icon: userProfile.is_deleted ? XCircle : CheckCircle,
      iconBgColor: userProfile.is_deleted ? "bg-error-50" : "bg-success-50",
      iconColor: userProfile.is_deleted ? "text-error-500" : "text-success-500",
      delay: 0.1,
    },
    {
      title: "注册时间",
      value: userProfile.created_at ? handleDateFormat(userProfile.created_at, format) : "未知",
      icon: Clock,
      iconBgColor: "bg-info-50",
      iconColor: "text-info-500",
      delay: 0.2,
    },
    {
      title: "最后更新",
      value: userProfile.updated_at ? handleDateFormat(userProfile.updated_at, format) : "未知",
      icon: Clock,
      iconBgColor: "bg-warning-50",
      iconColor: "text-warning-500",
      delay: 0.3,
    },
  ];

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header Section */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground-50 mb-1 sm:mb-2">用户资料</h1>
        <p className="text-sm sm:text-base text-foreground-300">查看用户个人信息</p>
      </div>

      {/* Profile Card with Avatar */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card-50 border border-border-50 rounded-sm p-6"
        >
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-50">
                {userProfile.avatar_url ? (
                  <Image
                    src={userProfile.avatar_url}
                    alt={`${userProfile.username} avatar`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-primary-500 text-3xl font-bold">
                      {userProfile.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground-50 mb-1">{userProfile.username}</h2>
              <p className="text-sm text-foreground-400">{userProfile.email}</p>
              {userProfile.role && (
                <p className="text-xs text-foreground-300 mt-1">角色: {userProfile.role}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Card */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card-50 border border-border-50 rounded-sm p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statsData.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="flex items-center space-x-3 p-3 bg-background-100 rounded-sm"
                >
                  <div className={`p-2 ${stat.iconBgColor} rounded-sm shrink-0`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-foreground-400 mb-1">{stat.title}</p>
                    <p className="text-sm font-semibold text-foreground-50 truncate">
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bio Section */}
      {userProfile.bio && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card-50 border border-border-50 rounded-sm p-4 sm:p-6"
          >
            <h3 className="text-base font-semibold text-foreground-50 flex items-center mb-3">
              <User className="w-4 h-4 mr-2 text-foreground-300" />
              个人简介
            </h3>
            <p className="text-sm text-foreground-300 leading-relaxed">{userProfile.bio}</p>
          </motion.div>
        </div>
      )}

      {/* Location Info (if available) */}
      {(userProfile.city ||
        (userProfile.latitude && userProfile.longitude) ||
        userProfile.ip_address) && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card-50 border border-border-50 rounded-sm p-4 sm:p-6"
          >
            <h3 className="text-base font-semibold text-foreground-50 flex items-center mb-4">
              <MapPin className="w-4 h-4 mr-2 text-foreground-300" />
              位置信息
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userProfile.city && (
                <div className="flex items-center space-x-3 p-3 bg-background-100 rounded-sm hover:bg-background-200 transition-colors">
                  <div className="shrink-0 w-10 h-10 bg-success-50 rounded-sm flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-success-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground-400 mb-0.5">城市</p>
                    <p className="text-sm font-medium text-foreground-50 truncate">
                      {userProfile.city}
                    </p>
                  </div>
                </div>
              )}
              {userProfile.latitude && userProfile.longitude && (
                <div className="flex items-center space-x-3 p-3 bg-background-100 rounded-sm hover:bg-background-200 transition-colors">
                  <div className="shrink-0 w-10 h-10 bg-info-50 rounded-sm flex items-center justify-center">
                    <MapIcon className="w-5 h-5 text-info-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground-400 mb-0.5">坐标</p>
                    <p className="text-xs text-foreground-500 font-mono truncate">
                      {userProfile.latitude}, {userProfile.longitude}
                    </p>
                  </div>
                </div>
              )}
              {userProfile.ip_address && (
                <div className="flex items-center space-x-3 p-3 bg-background-100 rounded-sm hover:bg-background-200 transition-colors">
                  <div className="shrink-0 w-10 h-10 bg-warning-50 rounded-sm flex items-center justify-center">
                    <Network className="w-5 h-5 text-warning-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground-400 mb-0.5">IP 地址</p>
                    <p className="text-xs text-foreground-500 font-mono truncate">
                      {userProfile.ip_address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
