"use client";

import { Archive, Edit, Eye, FolderOpen, Globe, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormatter, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import ProjectService from "@/app/lib/services/projectService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { OffsetPaginationResponse } from "@/app/types/commonType";
import type { ProjectItemDashboardResponse } from "@/app/types/projectServiceType";

interface ProjectListsProps {
  projectItems: ProjectItemDashboardResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void; // Optional callback for data refresh
}

const ProjectLists = ({
  projectItems,
  pagination,
  setCurrentPage,
  onDataChange,
}: ProjectListsProps) => {
  const _locale = useLocale();
  const format = useFormatter();
  const router = useRouter();
  const [optimisticProjects, setOptimisticProjects] =
    useState<ProjectItemDashboardResponse[]>(projectItems);

  // Update optimistic projects when projectItems prop changes
  useEffect(() => {
    setOptimisticProjects(projectItems);
  }, [projectItems]);

  const handleActionClick = async (action: string, projectSlug: string) => {
    // Find project by slug
    const project = optimisticProjects.find((p) => p.project_slug === projectSlug);

    if (!project) {
      console.error("Project not found:", projectSlug);
      return;
    }

    const projectId = project.project_id;

    if (action === "view") {
      // Navigate to project preview page
      router.push(`/dashboard/preview/?projectSlug=${projectSlug}&type=project`);
    } else if (action === "title_click") {
      // Navigate to actual project details page only if published
      if (project.is_published) {
        router.push(`/projects/${projectSlug}`);
      } else {
        // If not published, go to preview page
        router.push(`/dashboard/preview/?projectSlug=${projectSlug}&type=project`);
      }
    } else if (action === "edit") {
      // Navigate to project edit page
      router.push(`/dashboard/editor/?projectSlug=${projectSlug}&type=update`);
    } else if (action === "togglePublish") {
      // Optimistic update - immediately toggle publish status in UI
      setOptimisticProjects(
        optimisticProjects.map((p) =>
          p.project_slug === projectSlug ? { ...p, is_published: !p.is_published } : p,
        ),
      );

      try {
        // Prepare the payload
        const payload = {
          project_id: projectId,
          is_publish: !project.is_published,
        };

        // Call API in background
        const response = await ProjectService.togglePublishStatus(payload);

        if (response.status === 200) {
          toast.success("message" in response ? response.message : "Project status updated");
          // Refresh list after successful toggle
          if (onDataChange) {
            onDataChange();
          }
        } else {
          toast.error("error" in response ? response.error : "Failed to update project status");
          setOptimisticProjects(projectItems);
        }
      } catch (error) {
        // Rollback on error
        console.error("Failed to toggle publish status:", error);
        toast.error("Failed to update project status");
        setOptimisticProjects(projectItems);
      }
    } else if (action === "delete") {
      // Optimistic update - immediately remove from UI
      setOptimisticProjects(optimisticProjects.filter((p) => p.project_id !== projectId));

      try {
        // Call API in background
        const response = await ProjectService.deleteProject({
          project_id: projectId,
        });

        if (response.status === 200) {
          toast.success("message" in response ? response.message : "Project deleted");
          // Refresh list after successful delete to update pagination/total count
          if (onDataChange) {
            onDataChange();
          }
        } else {
          toast.error("error" in response ? response.error : "Failed to delete project");
          setOptimisticProjects(projectItems);
        }
      } catch (error) {
        // Rollback on error
        console.error("Failed to delete project:", error);
        toast.error("Failed to delete project");
        setOptimisticProjects(projectItems);
      }
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
                  项目
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  类型
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  状态
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
              {optimisticProjects.map((project: ProjectItemDashboardResponse, index: number) => (
                <motion.tr
                  key={project.project_slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                >
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                        {project.cover_url ? (
                          <Image
                            src={project.cover_url}
                            alt={`${project.project_name} cover`}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FolderOpen className="w-6 h-6 text-foreground-200" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleActionClick("title_click", project.project_slug)}
                          className="text-xs lg:text-sm font-medium text-foreground-50 hover:text-primary-500 transition-colors cursor-pointer text-left truncate w-full"
                        >
                          {project.project_name}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <span className="px-2 py-1 text-xs rounded-sm font-medium bg-primary-50 text-primary-500">
                      {project.project_type}
                    </span>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-sm font-medium ${
                        project.is_published
                          ? "bg-success-50 text-success-500"
                          : "bg-warning-50 text-warning-500"
                      }`}
                    >
                      {project.is_published ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <p className="text-xs lg:text-sm text-foreground-200">
                      {handleDateFormat(project.created_at, format)}
                    </p>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex justify-end space-x-1 lg:space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("view", project.project_slug)}
                        className="p-1.5 lg:p-2 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("edit", project.project_slug)}
                        className="p-1.5 lg:p-2 bg-primary-50 text-primary-500 rounded-sm hover:bg-primary-100 transition-colors"
                        title="编辑项目"
                      >
                        <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("togglePublish", project.project_slug)}
                        className={`p-1.5 lg:p-2 rounded-sm transition-colors ${
                          project.is_published
                            ? "bg-warning-50 text-warning-500 hover:bg-warning-100"
                            : "bg-success-50 text-success-500 hover:bg-success-100"
                        }`}
                        title={project.is_published ? "取消发布" : "发布"}
                      >
                        {project.is_published ? (
                          <Archive className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActionClick("delete", project.project_slug)}
                        className="p-1.5 lg:p-2 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                        title="删除项目"
                      >
                        <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>
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
          {optimisticProjects.map((project: ProjectItemDashboardResponse, index: number) => (
            <motion.div
              key={project.project_slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                    {project.cover_url ? (
                      <Image
                        src={project.cover_url}
                        alt={`${project.project_name} cover`}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FolderOpen className="w-6 h-6 text-foreground-200" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleActionClick("title_click", project.project_slug)}
                      className="text-sm font-medium text-foreground-50 hover:text-primary-500 transition-colors cursor-pointer text-left truncate w-full"
                    >
                      {project.project_name}
                    </button>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 text-xs rounded-sm font-medium bg-primary-50 text-primary-500">
                        {project.project_type}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-sm font-medium ${
                          project.is_published
                            ? "bg-success-50 text-success-500"
                            : "bg-warning-50 text-warning-500"
                        }`}
                      >
                        {project.is_published ? "已发布" : "草稿"}
                      </span>
                      <span className="text-xs text-foreground-300">
                        {handleDateFormat(project.created_at, format)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("view", project.project_slug)}
                    className="p-1.5 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors"
                    title="查看详情"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("edit", project.project_slug)}
                    className="p-1.5 bg-primary-50 text-primary-500 rounded-sm hover:bg-primary-100 transition-colors"
                    title="编辑项目"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("togglePublish", project.project_slug)}
                    className={`p-1.5 rounded-sm transition-colors ${
                      project.is_published
                        ? "bg-warning-50 text-warning-500 hover:bg-warning-100"
                        : "bg-success-50 text-success-500 hover:bg-success-100"
                    }`}
                    title={project.is_published ? "取消发布" : "发布"}
                  >
                    {project.is_published ? (
                      <Archive className="w-3.5 h-3.5" />
                    ) : (
                      <Globe className="w-3.5 h-3.5" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("delete", project.project_slug)}
                    className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors"
                    title="删除项目"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {optimisticProjects.map((project: ProjectItemDashboardResponse, index: number) => (
          <motion.div
            key={project.project_slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="space-y-2.5">
              {/* Project Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
                    {project.cover_url ? (
                      <Image
                        src={project.cover_url}
                        alt={`${project.project_name} cover`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FolderOpen className="w-5 h-5 text-foreground-200" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleActionClick("title_click", project.project_slug)}
                      className="text-sm font-medium text-foreground-50 hover:text-primary-500 transition-colors cursor-pointer text-left truncate w-full"
                    >
                      {project.project_name}
                    </button>
                  </div>
                </div>
              </div>

              {/* Project Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 text-[10px] rounded-sm font-medium bg-primary-50 text-primary-500">
                    {project.project_type}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-sm font-medium ${
                      project.is_published
                        ? "bg-success-50 text-success-500"
                        : "bg-warning-50 text-warning-500"
                    }`}
                  >
                    {project.is_published ? "已发布" : "草稿"}
                  </span>
                  <span className="text-[10px] text-foreground-300">
                    {handleDateFormat(project.created_at, format)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("view", project.project_slug)}
                    className="p-1.5 bg-background-50 text-foreground-100 rounded-sm hover:bg-background-100 transition-colors active:bg-background-200"
                    title="查看详情"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("edit", project.project_slug)}
                    className="p-1.5 bg-primary-50 text-primary-500 rounded-sm hover:bg-primary-100 transition-colors active:bg-primary-100"
                    title="编辑项目"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("togglePublish", project.project_slug)}
                    className={`p-1.5 rounded-sm transition-colors ${
                      project.is_published
                        ? "bg-warning-50 text-warning-500 hover:bg-warning-100 active:bg-warning-100"
                        : "bg-success-50 text-success-500 hover:bg-success-100 active:bg-success-100"
                    }`}
                    title={project.is_published ? "取消发布" : "发布"}
                  >
                    {project.is_published ? (
                      <Archive className="w-3.5 h-3.5" />
                    ) : (
                      <Globe className="w-3.5 h-3.5" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleActionClick("delete", project.project_slug)}
                    className="p-1.5 bg-error-50 text-error-400 rounded-sm hover:bg-error-100 transition-colors active:bg-error-100"
                    title="删除项目"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {optimisticProjects.length > 0 && (
        <div className="mt-6">
          <OffsetPagination
            pagination={pagination}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectLists;
