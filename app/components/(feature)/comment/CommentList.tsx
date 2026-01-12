import { Clock, Edit3, Loader2, MapPin, MessageCircle, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import React, { useState } from "react";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import { useAuth } from "@/app/contexts/hooks/useAuth";
import blogService from "@/app/lib/services/blogService";
import boardService from "@/app/lib/services/boardService";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { BlogCommentItem } from "@/app/types/blogServiceType";
import type { BoardCommentItem } from "@/app/types/boardServiceType";
import type { APIResponse } from "@/app/types/clientType";
import CommentTextInput, { CommentType } from "./CommentTextInput";

// 联合类型，支持博客和论坛评论
type CommentItem = BoardCommentItem | BlogCommentItem;

interface CommentListProps {
  type: CommentType;
  targetId: number;
  isAuthenticated: boolean;
}

const CommentList = ({ type, targetId, isAuthenticated }: CommentListProps) => {
  const commentT = useTranslations("comment");
  const commonT = useTranslations("common");
  const format = useFormatter();
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

  // 构建初始 API 端点（不包含 cursor）
  const getInitialApiEndpoint = () => {
    if (type === CommentType.BLOG) {
      return `/blog/get-blog-comment-lists/${targetId}?limit=${limit}&cursor=null`;
    } else {
      return `/board/get-board-comment-lists/${targetId}?limit=${limit}&cursor=null`;
    }
  };

  // 获取初始评论列表（只获取第一页）
  const { data: commentsData, isLoading, error } = useSWR(getInitialApiEndpoint());

  // 检查是否有任何操作正在进行
  const isAnyOperationInProgress = (commentId: number) => {
    return (
      replyingTo === commentId || editingComment === commentId || deletingComment === commentId
    );
  };

  // 处理删除开始
  const handleDeleteStart = (commentId: number) => {
    setDeletingComment(commentId);
  };

  // 处理删除评论
  const handleDelete = async (commentId: number) => {
    try {
      let response: APIResponse<null>;
      if (type === CommentType.BLOG) {
        response = await blogService.deleteBlogComment({
          comment_id: commentId,
        });
      } else {
        response = await boardService.deleteBoardComment({
          board_comment_id: commentId,
        });
      }

      if (response.status === 200) {
        toast.success("message" in response ? response.message : "Comment deleted");
        // 从本地状态中移除已删除的评论，避免重新获取
        setAllComments((prevComments) =>
          prevComments.filter((comment) => comment.comment_id !== commentId),
        );
        // 重新获取评论列表（可选，用于确保数据一致性）
        mutate(getInitialApiEndpoint());
      } else {
        toast.error("error" in response ? response.error : "Failed to delete comment");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setDeletingComment(null);
    }
  };

  // 处理加载更多
  const handleLoadMore = async () => {
    if (!hasNext || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      let response: APIResponse<{
        comments: CommentItem[];
        pagination: {
          next_cursor: string | null;
          has_next: boolean;
        };
      }>;
      if (type === CommentType.BLOG) {
        response = await blogService.getBlogCommentLists({
          blog_id: targetId,
          limit,
          cursor: cursor || undefined,
        });
      } else {
        response = await boardService.getBoardCommentLists({
          board_id: targetId,
          limit,
          cursor: cursor || undefined,
        });
      }

      if (response && "data" in response && response.data) {
        const responseData = response.data;
        if (responseData.comments && responseData.pagination) {
          setAllComments((prev) => {
            // 检查是否已经有相同的评论，避免重复添加
            const newComments = responseData.comments.filter(
              (newComment: CommentItem) =>
                !prev.some(
                  (existingComment) => existingComment.comment_id === newComment.comment_id,
                ),
            );
            return newComments.length > 0 ? [...prev, ...newComments] : prev;
          });
          setCursor((prevCursor) => {
            const newCursor = responseData.pagination.next_cursor;
            return prevCursor !== newCursor ? newCursor : prevCursor;
          });
          setHasNext((prevHasNext) => {
            const newHasNext = responseData.pagination.has_next;
            return prevHasNext !== newHasNext ? newHasNext : prevHasNext;
          });
        }
      }
    } catch (error) {
      console.error("Failed to load more comments:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 统一的输入组件
  const CommentInput = ({
    comment,
    isThirdLevel = false,
  }: {
    comment: CommentItem;
    isThirdLevel?: boolean;
  }) => {
    const isReplying = replyingTo === comment.comment_id;
    const isEditing = editingComment === comment.comment_id;

    // 第三层评论只允许编辑，不允许回复
    if (isThirdLevel && isReplying) return null;
    if (!isReplying && !isEditing) return null;

    const handleComplete = () => {
      if (isEditing) setEditingComment(null);
      if (isReplying) setReplyingTo(null);
    };

    return (
      <div className="mt-2 sm:mt-3 ml-2 sm:ml-4">
        {type === CommentType.BLOG ? (
          <CommentTextInput
            type={CommentType.BLOG}
            blog_id={targetId}
            parent_id={isReplying ? comment.comment_id : undefined}
            comment_id={isEditing ? comment.comment_id : undefined}
            isEdited={isEditing}
            initialComment={isEditing ? comment.comment : undefined}
            isAuthenticated={isAuthenticated}
            onComplete={handleComplete}
            onCancel={handleComplete}
          />
        ) : (
          <CommentTextInput
            type={CommentType.BOARD}
            board_id={targetId}
            parent_id={isReplying ? comment.comment_id : undefined}
            board_comment_id={isEditing ? comment.comment_id : undefined}
            isEdited={isEditing}
            initialComment={isEditing ? comment.comment : undefined}
            isAuthenticated={isAuthenticated}
            onComplete={handleComplete}
            onCancel={handleComplete}
          />
        )}
      </div>
    );
  };

  // 评论头部组件
  const CommentHeader = ({
    comment,
    size = "md",
  }: {
    comment: CommentItem;
    size?: "sm" | "md";
  }) => {
    const isSmall = size === "sm";
    const avatarSize = isSmall ? 28 : 36;
    const iconSize = isSmall ? "w-3 h-3" : "w-4 h-4";
    const textSize = isSmall ? "text-sm" : "text-base";
    const avatarClass = `rounded-full object-cover ${
      comment.user_role === "admin" ? "border border-blue-500" : "border border-gray-200"
    }`;

    return (
      <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-3">
        <div className="shrink-0">
          {isAuthenticated ? (
            <Link href={`/user?userId=${comment.user_id}`} className="group">
              <Image
                src={comment.avatar_url || "/images/default-avatar.png"}
                alt={comment.username || "User"}
                width={avatarSize}
                height={avatarSize}
                className={`w-7 h-7 sm:w-9 sm:h-9 ${avatarClass} group-hover:border-blue-600 transition-colors`}
              />
            </Link>
          ) : (
            <Image
              src={comment.avatar_url || "/images/default-avatar.png"}
              alt={comment.username || "User"}
              width={avatarSize}
              height={avatarSize}
              className={`w-7 h-7 sm:w-9 sm:h-9 ${avatarClass}`}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs sm:text-sm text-foreground-400 mb-1">
            {/* 移动端：用户名和城市在同一行 */}
            <div className="flex items-center justify-between sm:hidden">
              <h4
                className={`font-medium text-foreground-50 truncate flex-1 min-w-0 mr-2 ${textSize}`}
              >
                {comment.username || "匿名用户"}
              </h4>
              <span className="flex items-center shrink-0">
                <MapPin className={`${iconSize} mr-1`} />
                <span className="whitespace-nowrap text-xs">{comment.city || "Unknown"}</span>
              </span>
            </div>

            {/* 桌面端：用户名单独一行 */}
            <h4 className={`font-medium text-foreground-50 truncate ${textSize} hidden sm:block`}>
              {comment.username || "匿名用户"}
            </h4>

            {/* 移动端：创建时间在用户名下面 */}
            <div className="flex items-center mt-1 sm:hidden">
              <Clock className={`${iconSize} mr-1`} />
              <span className="text-xs">
                {comment.updated_at
                  ? `${commonT("updatedAt")} ${handleDateFormat(
                      comment.updated_at,
                      format,
                      "second",
                    )}`
                  : handleDateFormat(comment.created_at, format, "second")}
              </span>
            </div>

            {/* 桌面端：城市和时间在同一行 */}
            <div className="hidden sm:flex items-center space-x-3">
              <span className="flex items-center">
                <MapPin className={`${iconSize} mr-1`} />
                <span>{comment.city || ""}</span>
              </span>
              <span className="flex items-center">
                <Clock className={`${iconSize} mr-1`} />
                <span className="text-xs">
                  {comment.updated_at
                    ? `${commonT("updatedAt")} ${handleDateFormat(
                        comment.updated_at,
                        format,
                        "second",
                      )}`
                    : handleDateFormat(comment.created_at, format, "second")}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 操作按钮组件
  const ActionButtons = ({
    comment,
    size = "md",
    showReply = true,
  }: {
    comment: CommentItem;
    size?: "sm" | "md";
    showReply?: boolean;
  }) => {
    const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

    // 获取当前用户信息
    const currentUserId = user?.user_id;
    const currentUserRole = user?.role;

    // 判断是否为评论作者
    const isOwner = comment.user_id === currentUserId;

    // 判断是否为管理员
    const isAdmin = currentUserRole === "admin";

    // 可以编辑：仅评论作者本人
    const canEdit = isOwner;

    // 可以删除：评论作者本人 或 管理员
    const canDelete = isOwner || isAdmin;

    const buttonClass =
      "flex items-center space-x-1 text-xs sm:text-sm text-foreground-400 hover:text-foreground-200 transition-colors disabled:text-foreground-500 disabled:cursor-not-allowed px-2 py-1 sm:px-0 sm:py-0 rounded-sm sm:rounded-none hover:bg-background-200 sm:hover:bg-transparent";

    return (
      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border-100">
        <div className="flex items-center space-x-1 sm:space-x-3">
          {isAuthenticated && showReply && (
            <button
              type="button"
              onClick={() => setReplyingTo(comment.comment_id)}
              disabled={isAnyOperationInProgress(comment.comment_id)}
              className={buttonClass}
            >
              <MessageCircle className={iconSize} />
              <span className="hidden sm:inline">{commonT("reply")}</span>
              <span className="sm:hidden">{commonT("reply")}</span>
            </button>
          )}
        </div>

        {isAuthenticated && (canEdit || canDelete) && (
          <div className="flex items-center space-x-1 sm:space-x-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => setEditingComment(comment.comment_id)}
                disabled={isAnyOperationInProgress(comment.comment_id)}
                className={buttonClass}
              >
                <Edit3 className={iconSize} />
                <span className="hidden sm:inline">{commonT("edit")}</span>
                <span className="sm:hidden">{commonT("edit")}</span>
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  handleDeleteStart(comment.comment_id);
                  handleDelete(comment.comment_id);
                }}
                disabled={isAnyOperationInProgress(comment.comment_id)}
                className={buttonClass}
              >
                <Trash2 className={iconSize} />
                <span className="hidden sm:inline">{commonT("delete")}</span>
                <span className="sm:hidden">{commonT("delete")}</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // 初始化评论列表和分页状态（只处理初始数据）
  React.useEffect(() => {
    if (commentsData) {
      const data = commentsData.success ? commentsData.data : commentsData;
      const comments = data?.comments || [];
      const paginationData = data?.pagination || null;

      // 使用 useRef 来跟踪上一次的数据，避免无限循环
      const currentDataString = JSON.stringify(comments);

      if (prevDataRef.current !== currentDataString) {
        setAllComments(comments);
        prevDataRef.current = currentDataString;
      }

      // 只在初始加载时设置分页信息
      if (paginationData) {
        setCursor(paginationData.next_cursor || null);
        setHasNext(paginationData.has_next || false);
      }
    } else {
      // 当没有数据时，确保 allComments 为空数组
      setAllComments([]);
    }
  }, [commentsData]); // 移除 cursor 依赖，避免循环

  if (isLoading) {
    return (
      <LoadingSpinner variant="wave" size="lg" message={commonT("loading")} fullScreen={true} />
    );
  }

  if (!isLoading && (error as { status?: number })?.status === 404) {
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
        showReload={true}
      />
    );
  }

  if (!isLoading && !error && allComments.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title={commentT("noComments")}
        description={commonT("beFirstToComment")}
      />
    );
  }

  return (
    <motion.div
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {allComments.map((comment: CommentItem, index: number) => (
          <motion.div
            key={comment.comment_id}
            className="bg-card-100 rounded-sm p-2 sm:p-4 border border-border-100"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{
              duration: 0.6,
              delay: index * 0.08,
              type: "spring",
              stiffness: 80,
              damping: 20,
            }}
            whileHover={{
              scale: 1.01,
              transition: {
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 20,
              },
            }}
          >
            {/* 评论头部 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.15,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
            >
              <CommentHeader comment={comment} />
            </motion.div>

            {/* 评论内容 */}
            <motion.div
              className="mb-3 sm:mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.25,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
            >
              <p className="text-sm sm:text-base text-foreground-200 leading-relaxed whitespace-pre-wrap wrap-break-word">
                {comment.comment}
              </p>
            </motion.div>

            {/* 操作按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.35,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
            >
              <ActionButtons comment={comment} />
            </motion.div>

            {/* 统一的输入框 */}
            <CommentInput comment={comment} />

            {/* 子评论 */}
            {comment.children && comment.children.length > 0 && (
              <motion.div
                className="mt-3 sm:mt-4 space-y-2 sm:space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{
                  duration: 0.6,
                  delay: 0.45,
                  type: "spring",
                  stiffness: 80,
                  damping: 20,
                }}
              >
                <motion.div
                  className="flex items-center space-x-2 text-xs sm:text-sm text-foreground-400"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.5,
                    type: "spring",
                    stiffness: 120,
                    damping: 15,
                  }}
                >
                  <motion.div
                    className="w-4 sm:w-6 h-px bg-border-100"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.55,
                      type: "spring",
                      stiffness: 150,
                      damping: 20,
                    }}
                  ></motion.div>
                  <span>{commonT("replies", { count: comment.children.length })}</span>
                  <motion.div
                    className="w-4 sm:w-6 h-px bg-border-100"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.55,
                      type: "spring",
                      stiffness: 150,
                      damping: 20,
                    }}
                  ></motion.div>
                </motion.div>
                {comment.children.map((child: CommentItem, childIndex: number) => (
                  <motion.div
                    key={child.comment_id}
                    className="ml-1 sm:ml-4 pl-1 sm:pl-4 border-l-2 border-border-100 bg-background-50 rounded-sm p-1 sm:p-3"
                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.6 + childIndex * 0.08,
                      type: "spring",
                      stiffness: 80,
                      damping: 20,
                    }}
                    whileHover={{
                      scale: 1.01,
                      transition: {
                        duration: 0.3,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                  >
                    <CommentHeader comment={child} size="sm" />

                    <div className="mb-1 sm:mb-2">
                      <p className="text-xs sm:text-sm text-foreground-200 leading-relaxed whitespace-pre-wrap wrap-break-word">
                        {child.comment}
                      </p>
                    </div>

                    <ActionButtons comment={child} size="sm" />

                    {/* 统一的输入框 */}
                    <CommentInput comment={child} />

                    {/* 第三层评论 */}
                    {child.children && child.children.length > 0 && (
                      <motion.div
                        className="mt-2 sm:mt-3 space-y-1 sm:space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{
                          duration: 0.5,
                          type: "spring",
                          stiffness: 80,
                          damping: 20,
                        }}
                      >
                        {child.children.map((grandChild: CommentItem, grandChildIndex: number) => (
                          <motion.div
                            key={grandChild.comment_id}
                            className="ml-0 sm:ml-2 pl-0 sm:pl-2 border-l-2 border-border-200 bg-card-200 rounded-sm p-1 sm:p-2"
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.7 + grandChildIndex * 0.06,
                              type: "spring",
                              stiffness: 100,
                              damping: 20,
                            }}
                            whileHover={{
                              scale: 1.01,
                              transition: {
                                duration: 0.3,
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              },
                            }}
                          >
                            <CommentHeader comment={grandChild} size="sm" />

                            <div className="mb-1">
                              <p className="text-xs text-foreground-200 leading-relaxed whitespace-pre-wrap wrap-break-word">
                                {grandChild.comment}
                              </p>
                            </div>

                            <ActionButtons comment={grandChild} size="sm" showReply={false} />
                            {/* 第三层评论只显示编辑输入框，不显示回复输入框 */}
                            <CommentInput comment={grandChild} isThirdLevel={true} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 加载更多按钮 */}
      {hasNext && (
        <motion.div
          className="text-center py-4 sm:py-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            type: "spring",
            stiffness: 80,
            damping: 20,
          }}
        >
          <motion.button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-sm hover:bg-primary-700 disabled:bg-background-300 disabled:text-foreground-500 transition-colors duration-200 flex items-center gap-2 mx-auto text-sm sm:text-base min-h-11 sm:min-h-12"
            whileHover={{
              scale: 1.03,
              transition: {
                duration: 0.2,
                type: "spring",
                stiffness: 400,
                damping: 25,
              },
            }}
            whileTap={{
              scale: 0.98,
              transition: {
                duration: 0.1,
                type: "spring",
                stiffness: 500,
                damping: 30,
              },
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.5,
              type: "spring",
              stiffness: 120,
              damping: 20,
            }}
          >
            {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            <span className="hidden sm:inline">
              {isLoadingMore ? commonT("loading") : commonT("loadMore")}
            </span>
            <span className="sm:hidden">
              {isLoadingMore ? commonT("loading") : commonT("loadMore")}
            </span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CommentList;
