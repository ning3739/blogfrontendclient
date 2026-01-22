import { Loader2, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import { useAuth } from "@/app/hooks/useAuth";
import blogService from "@/app/lib/services/blogService";
import boardService from "@/app/lib/services/boardService";
import type { BlogCommentItem, GetBlogCommentListsResponse } from "@/app/types/blogServiceType";
import type { BoardCommentItem, GetBoardCommentListsResponse } from "@/app/types/boardServiceType";
import type { APIResponse } from "@/app/types/clientType";
import CommentActions from "./CommentActions";
import CommentHeader from "./CommentHeader";
import CommentItemInput from "./CommentItemInput";
import { CommentType } from "./CommentTextInput";

type CommentItem = BoardCommentItem | BlogCommentItem;

interface CommentListProps {
  type: CommentType;
  targetId: number;
  isAuthenticated: boolean;
}

const CommentList = ({ type, targetId, isAuthenticated }: CommentListProps) => {
  const commentT = useTranslations("comment");
  const commonT = useTranslations("common");
  const { user } = useAuth();

  const [limit] = useState(10);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [deletingComment, setDeletingComment] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allComments, setAllComments] = useState<CommentItem[]>([]);
  const prevDataRef = React.useRef<string | null>(null);

  const apiEndpoint =
    type === CommentType.BLOG
      ? `/blog/get-blog-comment-lists/${targetId}?limit=${limit}&cursor=null`
      : `/board/get-board-comment-lists/${targetId}?limit=${limit}&cursor=null`;

  const { data: commentsData, isLoading, error } = useSWR(apiEndpoint);

  const isOperationInProgress = (commentId: number) =>
    replyingTo === commentId || editingComment === commentId || deletingComment === commentId;

  const handleDelete = async (commentId: number) => {
    setDeletingComment(commentId);
    try {
      const response: APIResponse<unknown> =
        type === CommentType.BLOG
          ? await blogService.deleteBlogComment({ comment_id: commentId })
          : await boardService.deleteBoardComment({ board_comment_id: commentId });

      if (response.status === 200) {
        toast.success("message" in response ? response.message : "Comment deleted");
        setAllComments((prev) => prev.filter((c) => c.comment_id !== commentId));
        mutate(apiEndpoint);
      } else {
        toast.error("error" in response ? response.error : "Failed to delete comment");
      }
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setDeletingComment(null);
    }
  };

  const handleLoadMore = async () => {
    if (!hasNext || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const response: APIResponse<GetBlogCommentListsResponse | GetBoardCommentListsResponse> =
        type === CommentType.BLOG
          ? await blogService.getBlogCommentLists({
              blog_id: targetId,
              limit,
              cursor: cursor || undefined,
            })
          : await boardService.getBoardCommentLists({
              board_id: targetId,
              limit,
              cursor: cursor || undefined,
            });

      if (response && "data" in response && response.data) {
        const { comments, pagination } = response.data;
        if (comments && pagination) {
          setAllComments((prev) => {
            const newComments = comments.filter(
              (c: CommentItem) => !prev.some((p) => p.comment_id === c.comment_id),
            );
            return newComments.length > 0 ? [...prev, ...newComments] : prev;
          });
          setCursor(pagination.next_cursor || null);
          setHasNext(pagination.has_next || false);
        }
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Initialize comments from SWR data
  React.useEffect(() => {
    if (commentsData) {
      const data = commentsData.success ? commentsData.data : commentsData;
      const comments = data?.comments || [];
      const currentDataString = JSON.stringify(comments);

      if (prevDataRef.current !== currentDataString) {
        setAllComments(comments);
        prevDataRef.current = currentDataString;
      }

      if (data?.pagination) {
        setCursor(data.pagination.next_cursor || null);
        setHasNext(data.pagination.has_next || false);
      }
    } else {
      setAllComments([]);
    }
  }, [commentsData]);

  // Render states
  if (isLoading) {
    return <LoadingSpinner variant="wave" size="lg" message={commonT("loading")} fullScreen />;
  }

  if (
    (error as { status?: number })?.status === 404 ||
    (!isLoading && !error && allComments.length === 0)
  ) {
    return (
      <EmptyState
        icon={MessageCircle}
        title={commentT("noComments")}
        description={commonT("beFirstToComment")}
      />
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
        showReload
      />
    );
  }

  // Render comment item
  const renderComment = (comment: CommentItem, level: 0 | 1 | 2, index: number) => {
    const size = level === 0 ? "md" : "sm";
    const showReply = level < 2;
    const isThirdLevel = level === 2;

    const containerClass =
      level === 0
        ? "bg-card-100 rounded-sm p-2 sm:p-4 border border-border-100"
        : level === 1
          ? "ml-1 sm:ml-4 pl-1 sm:pl-4 border-l-2 border-border-100 bg-background-50 rounded-sm p-1 sm:p-3"
          : "ml-0 sm:ml-2 pl-0 sm:pl-2 border-l-2 border-border-200 bg-card-200 rounded-sm p-1 sm:p-2";

    return (
      <motion.div
        key={comment.comment_id}
        className={containerClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ scale: 1.01 }}
      >
        <CommentHeader comment={comment} size={size} isAuthenticated={isAuthenticated} />

        <div className={level === 0 ? "mb-3 sm:mb-4" : "mb-1 sm:mb-2"}>
          <p
            className={`${level === 2 ? "text-xs" : "text-xs sm:text-sm"} text-foreground-200 leading-relaxed whitespace-pre-wrap break-words`}
          >
            {comment.comment}
          </p>
        </div>

        <CommentActions
          comment={comment}
          size={size}
          showReply={showReply}
          isAuthenticated={isAuthenticated}
          currentUserId={user?.user_id}
          currentUserRole={user?.role}
          isOperationInProgress={isOperationInProgress(comment.comment_id)}
          onReply={() => setReplyingTo(comment.comment_id)}
          onEdit={() => setEditingComment(comment.comment_id)}
          onDelete={() => handleDelete(comment.comment_id)}
        />

        <CommentItemInput
          comment={comment}
          type={type}
          targetId={targetId}
          isAuthenticated={isAuthenticated}
          isReplying={replyingTo === comment.comment_id}
          isEditing={editingComment === comment.comment_id}
          isThirdLevel={isThirdLevel}
          onComplete={() => {
            setReplyingTo(null);
            setEditingComment(null);
          }}
        />

        {/* Children comments */}
        {comment.children && comment.children.length > 0 && level < 2 && (
          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-foreground-400">
              <div className="w-4 sm:w-6 h-px bg-border-100" />
              <span>{commonT("replies", { count: comment.children.length })}</span>
              <div className="w-4 sm:w-6 h-px bg-border-100" />
            </div>
            {comment.children.map((child: CommentItem, i: number) =>
              renderComment(child, (level + 1) as 1 | 2, i),
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence>
        {allComments.map((comment, index) => renderComment(comment, 0, index))}
      </AnimatePresence>

      {hasNext && (
        <div className="text-center py-4 sm:py-6">
          <motion.button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:bg-background-300 disabled:text-foreground-500 transition-colors flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoadingMore ? commonT("loading") : commonT("loadMore")}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default CommentList;
