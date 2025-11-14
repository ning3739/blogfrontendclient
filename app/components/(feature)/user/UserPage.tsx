"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import {
  User,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Bookmark,
  Eye,
} from "lucide-react";
import { motion } from "motion/react";
import { useFormatter, useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import type {
  UserResponse,
  GetMySavedBlogItemResponse,
} from "@/app/types/userServiceType";
import { OffsetPaginationResponse } from "@/app/types/commonType";

export default function UserPage() {
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const userId = userIdParam ? parseInt(userIdParam, 10) : null;
  const locale = useLocale();
  const format = useFormatter();
  const commonT = useTranslations("common");
  const userT = useTranslations("dashboard.myProfile");
  const savedBlogT = useTranslations("dashboard.mySaved");
  const userInfoT = useTranslations("user");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: userProfileResponse,
    isLoading: isLoadingUserProfile,
    error: errorUserProfile,
  } = useSWR<UserResponse>(
    userId && !isNaN(userId)
      ? `user/other/get-other-user-profile/${userId}`
      : null
  );

  const {
    data: userSavedBlogListsResponse,
    isLoading: isLoadingUserSavedBlogLists,
    error: errorUserSavedBlogLists,
  } = useSWR<[GetMySavedBlogItemResponse[], OffsetPaginationResponse]>(
    userId && !isNaN(userId)
      ? [
          `blog/get-saved-blog-lists?user_id=${userId}&page=${currentPage}&size=10`,
          locale,
        ]
      : null
  );

  if (!userIdParam || !userId || isNaN(userId) || !userProfileResponse) {
    return (
      <ErrorDisplay
        title={commonT("notFound")}
        message={commonT("notFoundMessage")}
        type="notFound"
        showReload={false}
      />
    );
  }

  if (isLoadingUserProfile || !userProfileResponse) {
    return (
      <LoadingSpinner
        message={commonT("loading")}
        size="md"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  // Only show page-level 404 if user profile is 404
  if (errorUserProfile) {
    if (errorUserProfile.status === 404) {
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
  const savedBlogItems = userSavedBlogListsResponse?.[0] || [];
  const pagination = userSavedBlogListsResponse?.[1];
  const hasNoSavedBlogs =
    savedBlogItems.length === 0 || errorUserSavedBlogLists?.status === 404;

  // Stats data configuration
  const statsData = [
    {
      title: userT("accountStatus"),
      value: userProfile.is_deleted ? userT("deleted") : userT("active"),
      icon: userProfile.is_deleted ? XCircle : CheckCircle,
      iconBgColor: userProfile.is_deleted ? "bg-error-50" : "bg-success-50",
      iconColor: userProfile.is_deleted ? "text-error-500" : "text-success-500",
      delay: 0.1,
    },
    {
      title: userT("registeredAt"),
      value: userProfile.created_at
        ? handleDateFormat(userProfile.created_at, format)
        : userT("location.unknown"),
      icon: Clock,
      iconBgColor: "bg-info-50",
      iconColor: "text-info-500",
      delay: 0.2,
    },
    {
      title: userT("lastLogin"),
      value: userProfile.updated_at
        ? handleDateFormat(userProfile.updated_at, format)
        : userT("location.unknown"),
      icon: Clock,
      iconBgColor: "bg-warning-50",
      iconColor: "text-warning-500",
      delay: 0.3,
    },
  ];

  return (
    <motion.div
      className="min-h-screen mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl mb-4 text-foreground-50 font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {userInfoT("userTitle")}
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mx-auto leading-relaxed text-foreground-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {userInfoT("userDescription")}
          </motion.p>

          {/* 分隔线 */}
          <motion.div
            className="max-w-2xl h-px bg-border-100 mx-auto mt-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
        </motion.div>

        {/* Profile Card with Avatar */}
        <div className="mb-6">
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
                <h2 className="text-2xl font-bold text-foreground-50 mb-1">
                  {userProfile.username}
                </h2>
                <p className="text-sm text-foreground-400 truncate mb-2">
                  {userProfile.email}
                </p>
                {userProfile.role && (
                  <p className="text-xs text-foreground-300 mt-1">
                    <span className="px-2 py-1 text-xs font-medium rounded-sm bg-background-200 text-foreground-100">
                      {userProfile.role.toLowerCase().charAt(0).toUpperCase() +
                        userProfile.role.toLowerCase().slice(1)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Card */}
        <div className="mb-6">
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

        {/* Bio Section */}
        {userProfile.bio && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card-50 border border-border-50 rounded-sm p-4 sm:p-6"
            >
              <h3 className="text-base font-semibold text-foreground-50 flex items-center mb-3">
                <User className="w-4 h-4 mr-2 text-foreground-300" />
                {userT("bio")}
              </h3>
              <p className="text-sm text-foreground-300 leading-relaxed">
                {userProfile.bio}
              </p>
            </motion.div>
          </div>
        )}

        {/* Saved Blogs Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-center sm:justify-start mb-6">
            <Bookmark className="w-5 h-5 mr-2 text-foreground-300" />
            <h2 className="text-2xl font-bold text-foreground-50">
              {userInfoT("savedBlogTitle")}
            </h2>
          </div>

          {isLoadingUserSavedBlogLists ? (
            <div className="bg-card-50 border border-border-50 rounded-sm p-6">
              <LoadingSpinner
                message={commonT("loading")}
                size="md"
                variant="wave"
              />
            </div>
          ) : errorUserSavedBlogLists &&
            errorUserSavedBlogLists.status !== 404 ? (
            <div className="bg-card-50 border border-border-50 rounded-sm p-6">
              <ErrorDisplay
                title={commonT("loadFailed")}
                message={commonT("loadFailedMessage")}
                type="error"
              />
            </div>
          ) : hasNoSavedBlogs ? (
            <div className="bg-card-50 border border-border-50 rounded-sm p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-foreground-300" />
              <p className="text-foreground-400">暂无收藏的博客</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-card-50 border border-border-50 rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-50">
                        <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                          {savedBlogT("blogTitle")}
                        </th>
                        <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                          {savedBlogT("savedAt")}
                        </th>
                        <th className="text-right py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                          {commonT("actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedBlogItems.map(
                        (blog: GetMySavedBlogItemResponse, index: number) => (
                          <motion.tr
                            key={blog.blog_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                          >
                            <td className="py-3 lg:py-4 px-3 lg:px-4">
                              <div className="flex items-center space-x-2 lg:space-x-3">
                                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                                  {blog.cover_url ? (
                                    <Image
                                      src={blog.cover_url}
                                      alt={`${blog.blog_title} cover`}
                                      width={56}
                                      height={56}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <FileText className="w-6 h-6 text-foreground-200" />
                                  )}
                                </div>
                                <Link
                                  href={`/${blog.section_slug}/${blog.blog_slug}`}
                                  className="flex-1 min-w-0"
                                >
                                  <p className="text-xs lg:text-sm font-medium text-foreground-50 truncate hover:text-primary-500 transition-colors">
                                    {blog.blog_title}
                                  </p>
                                </Link>
                              </div>
                            </td>
                            <td className="py-3 lg:py-4 px-3 lg:px-4">
                              <p className="text-xs lg:text-sm text-foreground-300">
                                {handleDateFormat(blog.saved_at, format)}
                              </p>
                            </td>
                            <td className="py-3 lg:py-4 px-3 lg:px-4">
                              <div className="flex justify-end space-x-1 lg:space-x-2">
                                <Link
                                  href={`/${blog.section_slug}/${blog.blog_slug}`}
                                >
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-1.5 lg:p-2 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                                    title="查看博客"
                                  >
                                    <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                  </motion.button>
                                </Link>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tablet Card View */}
              <div className="hidden md:block lg:hidden">
                <div className="space-y-3">
                  {savedBlogItems.map(
                    (blog: GetMySavedBlogItemResponse, index: number) => (
                      <motion.div
                        key={blog.blog_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card-50 border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                              {blog.cover_url ? (
                                <Image
                                  src={blog.cover_url}
                                  alt={`${blog.blog_title} cover`}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileText className="w-7 h-7 text-foreground-200" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/${blog.section_slug}/${blog.blog_slug}`}
                                className="flex-1 min-w-0"
                              >
                                <h3 className="text-sm font-medium text-foreground-50 truncate hover:text-primary-500 transition-colors">
                                  {blog.blog_title}
                                </h3>
                              </Link>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-foreground-300">
                              {handleDateFormat(blog.saved_at, format)}
                            </p>
                            <Link
                              href={`/${blog.section_slug}/${blog.blog_slug}`}
                            >
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                                title="查看博客"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </motion.button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {savedBlogItems.map(
                  (blog: GetMySavedBlogItemResponse, index: number) => (
                    <motion.div
                      key={blog.blog_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card-50 border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-12 h-12 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                            {blog.cover_url ? (
                              <Image
                                src={blog.cover_url}
                                alt={`${blog.blog_title} cover`}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileText className="w-5 h-5 text-foreground-200" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/${blog.section_slug}/${blog.blog_slug}`}
                              className="flex-1 min-w-0"
                            >
                              <h3 className="text-sm font-medium text-foreground-50 truncate hover:text-primary-500 transition-colors">
                                {blog.blog_title}
                              </h3>
                            </Link>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-foreground-300">
                            {handleDateFormat(blog.saved_at, format)}
                          </p>
                          <Link
                            href={`/${blog.section_slug}/${blog.blog_slug}`}
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors active:bg-primary-100"
                              title="查看博客"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
              </div>

              {pagination && (
                <div className="mt-6">
                  <OffsetPagination
                    pagination={pagination}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
