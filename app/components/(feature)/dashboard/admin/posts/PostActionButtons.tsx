"use client";

import {
  Archive,
  ArchiveRestore,
  Edit,
  Eye,
  Globe,
  Globe2,
  Info,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";

interface PostActionButtonsProps {
  blogSlug: string;
  isPublished: boolean;
  isArchived: boolean;
  isFeatured: boolean;
  onAction: (
    action: string,
    blogSlug: string,
    statusType?: "is_published" | "is_archived" | "is_featured",
    newValue?: boolean,
  ) => void;
  size?: "sm" | "md";
  showLabels?: boolean;
}

const PostActionButtons = ({
  blogSlug,
  isPublished,
  isArchived,
  isFeatured,
  onAction,
  size = "sm",
  showLabels = false,
}: PostActionButtonsProps) => {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const buttonPadding = size === "sm" ? "p-1.5" : "p-2";
  const labelButtonClass = "px-3 py-1.5 rounded-sm transition-colors text-xs font-medium";

  const ActionButton = ({
    onClick,
    className,
    title,
    icon,
    label,
  }: {
    onClick: () => void;
    className: string;
    title: string;
    icon: React.ReactNode;
    label?: string;
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={
        showLabels
          ? `${labelButtonClass} ${className}`
          : `${buttonPadding} ${className} rounded-sm transition-colors`
      }
      title={title}
    >
      {showLabels ? (
        <>
          <span className="inline mr-1">{icon}</span>
          {label}
        </>
      ) : (
        icon
      )}
    </motion.button>
  );

  return (
    <>
      {/* Info Button */}
      <ActionButton
        onClick={() => onAction("info", blogSlug)}
        className="bg-background-50 text-foreground-100 hover:bg-background-100"
        title="文章信息"
        icon={<Info className={iconSize} />}
      />

      {/* View Button */}
      <ActionButton
        onClick={() => onAction("view", blogSlug)}
        className="bg-background-50 text-foreground-100 hover:bg-background-100"
        title="查看详情"
        icon={<Eye className={iconSize} />}
      />

      {/* Edit Button */}
      <ActionButton
        onClick={() => onAction("edit", blogSlug)}
        className="bg-primary-50 text-primary-500 hover:bg-primary-100"
        title="编辑文章"
        icon={<Edit className={iconSize} />}
      />

      {/* Publish Button */}
      <ActionButton
        onClick={() => onAction("status_update", blogSlug, "is_published", !isPublished)}
        className={
          isPublished
            ? "bg-success-50 text-success-500 hover:bg-success-100"
            : "bg-background-50 text-foreground-300 hover:bg-background-100"
        }
        title={isPublished ? "取消发布" : "发布"}
        icon={isPublished ? <Globe className={iconSize} /> : <Globe2 className={iconSize} />}
        label={isPublished ? "取消发布" : "发布"}
      />

      {/* Archive Button */}
      <ActionButton
        onClick={() => onAction("status_update", blogSlug, "is_archived", !isArchived)}
        className={
          isArchived
            ? "bg-warning-50 text-warning-500 hover:bg-warning-100"
            : "bg-background-50 text-foreground-300 hover:bg-background-100"
        }
        title={isArchived ? "取消归档" : "归档"}
        icon={
          isArchived ? <Archive className={iconSize} /> : <ArchiveRestore className={iconSize} />
        }
        label={isArchived ? "取消归档" : "归档"}
      />

      {/* Feature Button */}
      <ActionButton
        onClick={() => onAction("status_update", blogSlug, "is_featured", !isFeatured)}
        className={
          isFeatured
            ? "bg-primary-50 text-primary-500 hover:bg-primary-100"
            : "bg-background-50 text-foreground-300 hover:bg-background-100"
        }
        title={isFeatured ? "取消精选" : "设为精选"}
        icon={isFeatured ? <Star className={iconSize} /> : <StarOff className={iconSize} />}
        label={isFeatured ? "取消精选" : "设为精选"}
      />

      {/* Delete Button */}
      <ActionButton
        onClick={() => onAction("delete", blogSlug)}
        className="bg-error-50 text-error-400 hover:bg-error-100"
        title="删除文章"
        icon={<Trash2 className={iconSize} />}
        label="删除"
      />
    </>
  );
};

export default PostActionButtons;
