"use client";

import { FolderOpen } from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import useSWR from "swr";
import ContentCard from "@/app/components/ui/card/ContentCard";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import type { ProjectItemResponse } from "@/app/types/projectServiceType";
import type { SectionListItem } from "@/app/types/sectionServiceType";

interface ProjectPageProps {
  sectionData: SectionListItem;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ sectionData }) => {
  const router = useRouter();
  const locale = useLocale();
  const commonT = useTranslations("common");
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: projectLists,
    isLoading,
    error,
  } = useSWR([`/project/get-project-lists?page=${currentPage}&size=6&published_only=true`, locale]);

  // 如果 sectionData 不存在，显示加载状态
  if (!sectionData) {
    return (
      <LoadingSpinner message={commonT("loading")} size="md" variant="wave" fullScreen={true} />
    );
  }

  if (isLoading) {
    return (
      <LoadingSpinner message={commonT("loading")} size="md" variant="wave" fullScreen={true} />
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

  const { items: projectItems = [], pagination } = projectLists || {};
  const isEmpty = !projectItems || projectItems.length === 0;

  return (
    <motion.div
      className="min-h-screen mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-3 py-12">
        {/* 页面标题区域 */}
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
            {sectionData.title}
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mx-auto leading-relaxed text-foreground-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {sectionData.description}
          </motion.p>

          {/* 分隔线 */}
          <motion.div
            className="max-w-2xl h-px bg-border-100 mx-auto mt-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
        </motion.div>

        {/* 项目列表区域 */}
        {isEmpty ? (
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
            />
          </motion.div>
        ) : (
          <>
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectItems.map((project: ProjectItemResponse) => (
                  <ContentCard
                    key={project.project_id}
                    content={{
                      id: project.project_id,
                      title: project.project_name,
                      description: project.project_description,
                      cover_url: project.cover_url,
                      tags: [{ id: 0, title: project.project_type }],
                      created_at: project.created_at,
                    }}
                    onClick={() => {
                      // TODO: 跳转到项目详情页
                      router.push(`${pathname}/${project.project_slug}`);
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* 分页组件区域 */}
            {pagination && (
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <OffsetPagination
                  pagination={pagination}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectPage;
