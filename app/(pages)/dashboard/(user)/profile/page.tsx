"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import {
  Camera,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Edit3,
  Map,
  Network,
} from "lucide-react";
import { motion } from "motion/react";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import EmptyState from "@/app/components/ui/error/EmptyState";
import { useFormatter, useTranslations } from "next-intl";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { UserResponse } from "@/app/types/userServiceType";
import ChangeAvatarModal from "@/app/components/(feature)/dashboard/user/profile/ChangeAvatarModal";
import ChangeBioModal from "@/app/components/(feature)/dashboard/user/profile/ChangeBioModal";

export default function ProfilePage() {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const format = useFormatter();
  const commonT = useTranslations("common");
  const dashboardT = useTranslations("dashboard.myProfile");

  const {
    data: userProfile,
    isLoading,
    error,
    mutate,
  } = useSWR<UserResponse>("user/me/get-my-profile");

  if (isLoading) {
    return (
      <LoadingSpinner
        message={commonT("loading")}
        size="md"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
      />
    );
  }

  // Stats data configuration (only when userProfile exists)
  const statsData = userProfile
    ? [
        {
          title: dashboardT("accountStatus"),
          value: userProfile.is_deleted
            ? dashboardT("deleted")
            : dashboardT("active"),
          icon: userProfile.is_deleted ? XCircle : CheckCircle,
          iconBgColor: userProfile.is_deleted ? "bg-error-50" : "bg-success-50",
          iconColor: userProfile.is_deleted
            ? "text-error-500"
            : "text-success-500",
          delay: 0.1,
        },
        {
          title: dashboardT("registeredAt"),
          value: userProfile.created_at
            ? handleDateFormat(userProfile.created_at, format)
            : dashboardT("unknown"),
          icon: Clock,
          iconBgColor: "bg-info-50",
          iconColor: "text-info-500",
          delay: 0.2,
        },
        {
          title: dashboardT("lastLogin"),
          value: userProfile.updated_at
            ? handleDateFormat(userProfile.updated_at, format)
            : dashboardT("unknown"),
          icon: Edit3,
          iconBgColor: "bg-warning-50",
          iconColor: "text-warning-500",
          delay: 0.3,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header Section */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground-50 mb-1 sm:mb-2">
          {dashboardT("title")}
        </h1>
        <p className="text-sm sm:text-base text-foreground-300">
          {dashboardT("description")}
        </p>
      </div>

      {!userProfile ? (
        /* Empty State */
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <EmptyState
            icon={User}
            title={commonT("notFound")}
            description={commonT("notFoundMessage")}
            iconBgColor="bg-primary-50"
            iconColor="text-primary-500"
          />
        </div>
      ) : (
        <>
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
                          {userProfile.username?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors border-2 border-background-50 shadow-sm"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-foreground-50 mb-1">
                    {userProfile.username}
                  </h2>
                  <p className="text-sm text-foreground-400">
                    {userProfile.email}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Card */}
          {statsData.length > 0 && (
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
                        <div
                          className={`p-2 ${stat.iconBgColor} rounded-sm shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-foreground-400 mb-1">
                            {stat.title}
                          </p>
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
          )}

          {/* Bio Section */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card-50 border border-border-50 rounded-sm p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-foreground-50 flex items-center">
                  <User className="w-4 h-4 mr-2 text-foreground-300" />
                  {dashboardT("bio")}
                </h3>
                <button
                  onClick={() => setIsBioModalOpen(true)}
                  className="p-1.5 rounded-sm hover:bg-background-100 text-foreground-400 hover:text-primary-500 transition-colors"
                  title={dashboardT("editBio")}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-foreground-300 leading-relaxed">
                {userProfile.bio || "还没有填写个人简介..."}
              </p>
            </motion.div>
          </div>

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
                  {dashboardT("location.title")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {userProfile.city && (
                    <div className="flex items-center space-x-3 p-3 bg-background-100 rounded-sm hover:bg-background-200 transition-colors">
                      <div className="shrink-0 w-10 h-10 bg-success-50 rounded-sm flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-success-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground-400 mb-0.5">
                          {dashboardT("location.city")}
                        </p>
                        <p className="text-sm font-medium text-foreground-50 truncate">
                          {userProfile.city}
                        </p>
                      </div>
                    </div>
                  )}
                  {userProfile.latitude && userProfile.longitude && (
                    <div className="flex items-center space-x-3 p-3 bg-background-100 rounded-sm hover:bg-background-200 transition-colors">
                      <div className="shrink-0 w-10 h-10 bg-info-50 rounded-sm flex items-center justify-center">
                        <Map className="w-5 h-5 text-info-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground-400 mb-0.5">
                          {dashboardT("location.coordinates")}
                        </p>
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
                        <p className="text-xs text-foreground-400 mb-0.5">
                          {dashboardT("location.ipAddress")}
                        </p>
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

          {/* Avatar Change Modal */}
          <ChangeAvatarModal
            isOpen={isAvatarModalOpen}
            onClose={() => setIsAvatarModalOpen(false)}
            onSuccess={() => {
              mutate();
              setIsAvatarModalOpen(false);
            }}
          />

          {/* Bio Change Modal */}
          <ChangeBioModal
            isOpen={isBioModalOpen}
            onClose={() => setIsBioModalOpen(false)}
            onSuccess={() => {
              mutate();
              setIsBioModalOpen(false);
            }}
            currentBio={userProfile.bio || ""}
          />
        </>
      )}
    </div>
  );
}
