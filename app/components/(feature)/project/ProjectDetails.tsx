"use client";

import React from "react";
import useSWR from "swr";
import Image from "next/image";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { useAuth } from "@/app/contexts/hooks/useAuth";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/app/components/ui/button/butten";
import {
  ShoppingCart,
  AlertTriangle,
  Download,
  FolderOpen,
} from "lucide-react";
import Share from "@/app/components/ui/share/Share";
import MediaService from "@/app/lib/services/mediaService";
import TOC from "../content/TOC";
import TextContent from "../content/TextContent";
import CopyRight from "@/app/components/ui/copyright/CopyRight";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import EmptyState from "@/app/components/ui/error/EmptyState";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import { formatCurrency } from "@/app/lib/utils/handleCurrencyFormat";

function ProjectDetails({ projectSlug }: { projectSlug: string }) {
  const projectT = useTranslations("project");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const format = useFormatter();
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`;

  // 构建 SWR key，包含用户ID（如果已认证且用户数据已加载）和语言
  const swrKey = user?.user_id
    ? [
        `/project/get-project-details/${projectSlug}?user_id=${user.user_id}&is_editor=false`,
        locale,
      ]
    : [`/project/get-project-details/${projectSlug}?is_editor=false`, locale];

  const { data: projectDetails, isLoading, error } = useSWR(swrKey);

  const router = useRouter();

  const handleBuyProject = (projectSlug: string) => {
    if (isAuthenticated) {
      router.push(`/payment?projectSlug=${projectSlug}`);
    } else {
      router.push(`/login`);
    }
  };

  const handleDownloadProject = async (attachmentId: number) => {
    await MediaService.downloadMedia({
      media_id: attachmentId,
    });
  };

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

  if (error && error.status !== 404) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
        showReload={true}
      />
    );
  }

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        {!projectDetails ? (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <EmptyState
              icon={FolderOpen}
              title={commonT("notFound")}
              description={commonT("notFoundMessage")}
              iconSize="w-12 h-12"
              iconBgSize="w-24 h-24"
              iconColor="text-primary-400"
              iconBgColor="bg-primary-50"
              variant="default"
            />
          </motion.div>
        ) : (
          <>
            {/* 项目封面区域 */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {projectDetails?.cover_url && (
                <motion.div
                  className="relative w-full h-64 md:h-80 mb-8 rounded-sm overflow-hidden cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Image
                    src={projectDetails?.cover_url || ""}
                    alt={projectDetails?.project_name || ""}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    priority
                  />
                </motion.div>
              )}

              <motion.h1
                className="text-4xl mb-4 text-foreground-50 font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {projectDetails?.project_name}
              </motion.h1>

              <motion.p
                className="text-lg max-w-2xl mx-auto leading-relaxed text-foreground-300 font-medium mb-8 italic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                {commonT("summary")}: {projectDetails?.project_description}
              </motion.p>

              {/* 时间信息 */}
              <motion.div
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                {/* 创建时间 */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-success-500"></div>
                  <span className="text-foreground-400 text-xs font-medium">
                    {commonT("createdAt")}:
                  </span>
                  <span className="text-foreground-200 font-semibold text-sm">
                    {handleDateFormat(projectDetails?.created_at || "", format)}
                  </span>
                </div>

                {/* 更新时间 */}
                {projectDetails?.updated_at && (
                  <>
                    <div className="hidden sm:block w-px h-4 bg-border-200"></div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-warning-500"></div>
                      <span className="text-foreground-400 text-xs font-medium">
                        {commonT("updatedAt")}:
                      </span>
                      <span className="text-foreground-200 font-semibold text-sm">
                        {handleDateFormat(
                          projectDetails?.updated_at || "",
                          format
                        )}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>

              {/* 分隔线 */}
              <motion.div
                className="max-w-2xl h-px bg-border-100 mx-auto"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              />
            </motion.div>

            {/* 项目内容区域 */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <TOC />
              <TextContent content={projectDetails?.project_content || ""} />
            </motion.div>

            {/* 版权信息 */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <CopyRight permalink={canonical} licenseText="CC BY-NC 4.0" />
            </motion.div>

            {/* 分享按钮 */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <Share
                url={canonical}
                title={projectDetails?.project_name || ""}
                createdAtText={`${commonT("createdAt")}: ${handleDateFormat(
                  projectDetails?.created_at || "",
                  format
                )}`}
              />
            </motion.div>

            {/* 分割线 */}
            {projectDetails?.project_price &&
              projectDetails.project_price > 0 && (
                <motion.div
                  className="max-full h-px bg-border-100 mx-auto mb-16"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                />
              )}

            {/* 项目价格和操作区域 */}
            {projectDetails?.project_price &&
              projectDetails.project_price > 0 && (
                <>
                  {/* 未购买时显示提示文字 */}
                  {!isAuthenticated && (
                    <motion.div
                      className="text-center mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                    >
                      <p className="text-base text-foreground-200 leading-relaxed max-w-2xl mx-auto font-medium">
                        {projectT("wantToKnowMore")}
                      </p>
                    </motion.div>
                  )}
                  <motion.div
                    className="bg-background-50 rounded-sm border border-border-100 p-4 sm:p-6 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-foreground-50">
                          {formatCurrency(
                            projectDetails?.project_price || 0,
                            format,
                            "NZD"
                          )}
                        </span>
                        <span className="text-sm text-foreground-300">
                          {projectT("price")}
                        </span>
                      </div>

                      <div className="flex items-center">
                        {isAuthenticated &&
                        projectDetails?.payment_status === "success" ? (
                          <span className="px-3 py-1 bg-success-100 text-success-700 text-sm font-medium rounded-sm">
                            {projectT("purchased")}
                          </span>
                        ) : !isAuthenticated ? (
                          <div className="flex items-center text-sm text-foreground-300">
                            <AlertTriangle className="w-4 h-4 mr-1 text-warning-500" />
                            <span>{projectT("loginToPurchase")}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {isAuthenticated &&
                      projectDetails?.payment_status === "success" ? (
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => {
                            if (projectDetails?.attachment_id) {
                              handleDownloadProject(
                                projectDetails.attachment_id
                              );
                            }
                          }}
                          className="w-full"
                          disabled={!projectDetails?.attachment_id}
                        >
                          <Download className="w-5 h-5 mr-2" />
                          {projectT("download")}
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => {
                            if (projectDetails?.project_slug) {
                              handleBuyProject(projectDetails.project_slug);
                            }
                          }}
                          className="w-full"
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {projectT("buy")}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default ProjectDetails;
