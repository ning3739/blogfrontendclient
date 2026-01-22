"use client";

import { Archive, Edit, Eye, FolderOpen, Globe, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormatter } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DeleteConfirmModal from "@/app/components/ui/modal/DeleteConfirmModal";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import ProjectService from "@/app/lib/services/projectService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { OffsetPaginationResponse } from "@/app/types/commonType";
import type { ProjectItemDashboardResponse } from "@/app/types/projectServiceType";

interface ProjectListsProps {
  projectItems: ProjectItemDashboardResponse[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void;
}

const ProjectLists = ({
  projectItems,
  pagination,
  setCurrentPage,
  onDataChange,
}: ProjectListsProps) => {
  const format = useFormatter();
  const router = useRouter();
  const [optimisticProjects, setOptimisticProjects] =
    useState<ProjectItemDashboardResponse[]>(projectItems);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectItemDashboardResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setOptimisticProjects(projectItems);
  }, [projectItems]);

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await ProjectService.deleteProject({
        project_id: projectToDelete.project_id,
      });

      if (response.status === 200) {
        setOptimisticProjects((prev) =>
          prev.filter((p) => p.project_id !== projectToDelete.project_id),
        );
        toast.success("message" in response ? response.message : "项目删除成功");
        setDeleteConfirmModal(false);
        setProjectToDelete(null);
        onDataChange?.();
      } else {
        setDeleteError("error" in response ? response.error : "删除项目失败");
      }
    } catch (err) {
      const error = err as { error?: string };
      setDeleteError(error.error || "删除项目失败，请稍后重试");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActionClick = async (action: string, projectSlug: string) => {
    const project = optimisticProjects.find((p) => p.project_slug === projectSlug);
    if (!project) return;

    switch (action) {
      case "view":
        router.push(`/dashboard/preview/?projectSlug=${projectSlug}&type=project`);
        break;
      case "title_click":
        router.push(
          project.is_published
            ? `/projects/${projectSlug}`
            : `/dashboard/preview/?projectSlug=${projectSlug}&type=project`,
        );
        break;
      case "edit":
        router.push(`/dashboard/editor/?projectSlug=${projectSlug}&type=update`);
        break;
      case "delete":
        setProjectToDelete(project);
        setDeleteConfirmModal(true);
        break;
      case "togglePublish":
        setOptimisticProjects((prev) =>
          prev.map((p) =>
            p.project_slug === projectSlug ? { ...p, is_published: !p.is_published } : p,
          ),
        );
        try {
          const response = await ProjectService.togglePublishStatus({
            project_id: project.project_id,
            is_publish: !project.is_published,
          });
          if (response.status === 200) {
            toast.success("message" in response ? response.message : "状态更新成功");
            onDataChange?.();
          } else {
            toast.error("error" in response ? response.error : "状态更新失败");
            setOptimisticProjects(projectItems);
          }
        } catch {
          toast.error("状态更新失败");
          setOptimisticProjects(projectItems);
        }
        break;
    }
  };

  // Action button component
  const ActionButton = ({
    onClick,
    className,
    title,
    icon,
    size = "sm",
  }: {
    onClick: () => void;
    className: string;
    title: string;
    icon: React.ReactNode;
    size?: "sm" | "md";
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${size === "sm" ? "p-1.5" : "p-2"} ${className} rounded-sm transition-colors`}
      title={title}
    >
      {icon}
    </motion.button>
  );

  // Project item component
  const ProjectItem = ({ project }: { project: ProjectItemDashboardResponse }) => (
    <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-sm overflow-hidden bg-background-50 flex items-center justify-center shrink-0">
        {project.cover_url ? (
          <Image
            src={project.cover_url}
            alt={project.project_name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        ) : (
          <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6 text-foreground-200" />
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
  );

  // Action buttons group
  const ActionButtons = ({
    project,
    size = "sm",
  }: {
    project: ProjectItemDashboardResponse;
    size?: "sm" | "md";
  }) => {
    const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
    return (
      <>
        <ActionButton
          onClick={() => handleActionClick("view", project.project_slug)}
          className="bg-background-50 text-foreground-100 hover:bg-background-100"
          title="查看详情"
          icon={<Eye className={iconSize} />}
          size={size}
        />
        <ActionButton
          onClick={() => handleActionClick("edit", project.project_slug)}
          className="bg-primary-50 text-primary-500 hover:bg-primary-100"
          title="编辑项目"
          icon={<Edit className={iconSize} />}
          size={size}
        />
        <ActionButton
          onClick={() => handleActionClick("togglePublish", project.project_slug)}
          className={
            project.is_published
              ? "bg-warning-50 text-warning-500 hover:bg-warning-100"
              : "bg-success-50 text-success-500 hover:bg-success-100"
          }
          title={project.is_published ? "取消发布" : "发布"}
          icon={
            project.is_published ? <Archive className={iconSize} /> : <Globe className={iconSize} />
          }
          size={size}
        />
        <ActionButton
          onClick={() => handleActionClick("delete", project.project_slug)}
          className="bg-error-50 text-error-400 hover:bg-error-100"
          title="删除项目"
          icon={<Trash2 className={iconSize} />}
          size={size}
        />
      </>
    );
  };

  // Status badges
  const StatusBadges = ({
    project,
    size = "sm",
  }: {
    project: ProjectItemDashboardResponse;
    size?: "xs" | "sm";
  }) => {
    const textSize = size === "xs" ? "text-[10px]" : "text-xs";
    const padding = size === "xs" ? "px-2 py-0.5" : "px-2 py-1";
    return (
      <>
        <span
          className={`${padding} ${textSize} rounded-sm font-medium bg-primary-50 text-primary-500`}
        >
          {project.project_type}
        </span>
        <span
          className={`${padding} ${textSize} rounded-sm font-medium ${project.is_published ? "bg-success-50 text-success-500" : "bg-warning-50 text-warning-500"}`}
        >
          {project.is_published ? "已发布" : "草稿"}
        </span>
      </>
    );
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-50">
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                项目
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                类型
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground-200">
                状态
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
            {optimisticProjects.map((project, index) => (
              <motion.tr
                key={project.project_slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
              >
                <td className="py-4 px-4">
                  <ProjectItem project={project} />
                </td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 text-xs rounded-sm font-medium bg-primary-50 text-primary-500">
                    {project.project_type}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-sm font-medium ${project.is_published ? "bg-success-50 text-success-500" : "bg-warning-50 text-warning-500"}`}
                  >
                    {project.is_published ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-foreground-200">
                    {handleDateFormat(project.created_at, format)}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-end space-x-2">
                    <ActionButtons project={project} size="md" />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden space-y-3">
        {optimisticProjects.map((project, index) => (
          <motion.div
            key={project.project_slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="flex items-center justify-between">
              <ProjectItem project={project} />
              <div className="flex space-x-1">
                <ActionButtons project={project} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 ml-14">
              <StatusBadges project={project} size="xs" />
              <span className="text-xs text-foreground-300">
                {handleDateFormat(project.created_at, format)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {optimisticProjects.map((project, index) => (
          <motion.div
            key={project.project_slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="space-y-2.5">
              <ProjectItem project={project} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <StatusBadges project={project} size="xs" />
                  <span className="text-[10px] text-foreground-300">
                    {handleDateFormat(project.created_at, format)}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <ActionButtons project={project} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {optimisticProjects.length > 0 && (
        <div className="mt-6">
          <OffsetPagination pagination={pagination} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmModal}
        onClose={() => {
          setDeleteConfirmModal(false);
          setProjectToDelete(null);
          setDeleteError("");
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        error={deleteError}
        itemTitle={projectToDelete?.project_name || ""}
        itemType="项目"
      />
    </div>
  );
};

export default ProjectLists;
