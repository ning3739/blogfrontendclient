import { Edit3, MessageCircle, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BlogCommentItem } from "@/app/types/blogServiceType";
import type { BoardCommentItem } from "@/app/types/boardServiceType";

type CommentItem = BoardCommentItem | BlogCommentItem;

interface CommentActionsProps {
  comment: CommentItem;
  size?: "sm" | "md";
  showReply?: boolean;
  isAuthenticated: boolean;
  currentUserId?: number;
  currentUserRole?: string;
  isOperationInProgress: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CommentActions = ({
  comment,
  size = "md",
  showReply = true,
  isAuthenticated,
  currentUserId,
  currentUserRole,
  isOperationInProgress,
  onReply,
  onEdit,
  onDelete,
}: CommentActionsProps) => {
  const commonT = useTranslations("common");
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  const isOwner = comment.user_id === currentUserId;
  const isAdmin = currentUserRole === "admin";
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  const buttonClass =
    "flex items-center space-x-1 text-xs sm:text-sm text-foreground-400 hover:text-foreground-200 transition-colors disabled:text-foreground-500 disabled:cursor-not-allowed px-2 py-1 sm:px-0 sm:py-0 rounded-sm sm:rounded-none hover:bg-background-200 sm:hover:bg-transparent";

  return (
    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border-100">
      <div className="flex items-center space-x-1 sm:space-x-3">
        {isAuthenticated && showReply && (
          <button
            type="button"
            onClick={onReply}
            disabled={isOperationInProgress}
            className={buttonClass}
          >
            <MessageCircle className={iconSize} />
            <span>{commonT("reply")}</span>
          </button>
        )}
      </div>

      {isAuthenticated && (canEdit || canDelete) && (
        <div className="flex items-center space-x-1 sm:space-x-2">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              disabled={isOperationInProgress}
              className={buttonClass}
            >
              <Edit3 className={iconSize} />
              <span>{commonT("edit")}</span>
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isOperationInProgress}
              className={buttonClass}
            >
              <Trash2 className={iconSize} />
              <span>{commonT("delete")}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentActions;
