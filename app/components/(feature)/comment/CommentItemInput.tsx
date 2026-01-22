import type { BlogCommentItem } from "@/app/types/blogServiceType";
import type { BoardCommentItem } from "@/app/types/boardServiceType";
import CommentTextInput, { CommentType } from "./CommentTextInput";

type CommentItem = BoardCommentItem | BlogCommentItem;

interface CommentItemInputProps {
  comment: CommentItem;
  type: CommentType;
  targetId: number;
  isAuthenticated: boolean;
  isReplying: boolean;
  isEditing: boolean;
  isThirdLevel?: boolean;
  onComplete: () => void;
}

const CommentItemInput = ({
  comment,
  type,
  targetId,
  isAuthenticated,
  isReplying,
  isEditing,
  isThirdLevel = false,
  onComplete,
}: CommentItemInputProps) => {
  // Third level comments only allow editing, not replying
  if (isThirdLevel && isReplying) return null;
  if (!isReplying && !isEditing) return null;

  const commonProps = {
    isEdited: isEditing,
    initialComment: isEditing ? comment.comment : undefined,
    isAuthenticated,
    onComplete,
    onCancel: onComplete,
  };

  return (
    <div className="mt-2 sm:mt-3 ml-2 sm:ml-4">
      {type === CommentType.BLOG ? (
        <CommentTextInput
          type={CommentType.BLOG}
          blog_id={targetId}
          parent_id={isReplying ? comment.comment_id : undefined}
          comment_id={isEditing ? comment.comment_id : undefined}
          {...commonProps}
        />
      ) : (
        <CommentTextInput
          type={CommentType.BOARD}
          board_id={targetId}
          parent_id={isReplying ? comment.comment_id : undefined}
          board_comment_id={isEditing ? comment.comment_id : undefined}
          {...commonProps}
        />
      )}
    </div>
  );
};

export default CommentItemInput;
