"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/app/components/ui/button/butten";
import InputField from "@/app/components/ui/input/InputField";
import boardService from "@/app/lib/services/boardService";
import blogService from "@/app/lib/services/blogService";
import { useAuth } from "@/app/contexts/hooks/useAuth";

// 评论类型枚举
export enum CommentType {
  BLOG = "blog",
  BOARD = "board",
}

// 基础评论输入组件属性
interface BaseCommentInputProps {
  isAuthenticated: boolean;
  parent_id?: number;
  isEdited?: boolean;
  initialComment?: string;
  onComplete?: () => void;
  onCancel?: () => void;
  onOptimisticCreate?: (text: string, parentId?: number) => void;
  onOptimisticEdit?: (commentId: number, nextText: string) => void;
}

// 博客评论属性
interface BlogCommentInputProps extends BaseCommentInputProps {
  type: CommentType.BLOG;
  blog_id: number;
  comment_id?: number;
}

// 论坛评论属性
interface BoardCommentInputProps extends BaseCommentInputProps {
  type: CommentType.BOARD;
  board_id: number;
  board_comment_id?: number;
}

// 联合类型
type CommentTextInputProps = BlogCommentInputProps | BoardCommentInputProps;

const CommentTextInput = (props: CommentTextInputProps) => {
  const {
    type,
    isAuthenticated,
    parent_id,
    isEdited,
    initialComment,
    onComplete,
    onCancel,
    onOptimisticCreate,
    onOptimisticEdit,
  } = props;

  // 获取翻译
  const commentT = useTranslations("comment");
  const { user } = useAuth();

  const [comment, setComment] = useState(initialComment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取评论ID（用于编辑）
  const getCommentId = () => {
    if (type === CommentType.BLOG) {
      return (props as BlogCommentInputProps).comment_id;
    } else {
      return (props as BoardCommentInputProps).board_comment_id;
    }
  };

  // 获取目标ID（blog_id 或 board_id）
  const getTargetId = () => {
    if (type === CommentType.BLOG) {
      return (props as BlogCommentInputProps).blog_id;
    } else {
      return (props as BoardCommentInputProps).board_id;
    }
  };

  // 提交评论
  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error(getTranslation("commentRequired"));
      return;
    }

    if (comment.length > 500) {
      toast.error(getTranslation("commentTooLong"));
      return;
    }

    setIsSubmitting(true);
    try {
      const targetId = getTargetId();
      const commentId = getCommentId();

      // 计算第一页 SWR key（useSWRInfinite 的第 0 页）
      const commentListKey =
        type === CommentType.BLOG
          ? `/blog/get-blog-comment-lists/${targetId}?limit=10&cursor=null`
          : `/board/get-board-comment-lists/${targetId}?limit=10&cursor=null`;

      // 乐观更新：编辑场景，先本地更新文本
      if (isEdited && commentId) {
        if (onOptimisticEdit) {
          onOptimisticEdit(commentId, comment.trim());
        } else {
          await mutate(
            (key: any) =>
              typeof key === "string" &&
              (key.startsWith(`/blog/get-blog-comment-lists/${targetId}`) ||
                key.startsWith(`/board/get-board-comment-lists/${targetId}`)),
            (current: any) => {
              const base = current?.success ? current.data : current;
              if (!base) return current;
              const updateText = (items: any[]): any[] =>
                items.map((c: any) => {
                  if (c.comment_id === commentId) {
                    return {
                      ...c,
                      comment: comment.trim(),
                      updated_at: new Date().toISOString(),
                    };
                  }
                  if (Array.isArray(c.children) && c.children.length > 0) {
                    return { ...c, children: updateText(c.children) };
                  }
                  return c;
                });
              const next = {
                ...base,
                comments: updateText(base.comments || []),
              };
              return current?.success ? { ...current, data: next } : next;
            },
            false
          );
        }
        // 编辑评论
        if (type === CommentType.BLOG) {
          await blogService.updateBlogComment({
            comment_id: commentId,
            comment: comment.trim(),
          });
        } else {
          await boardService.updateBoardComment({
            board_comment_id: commentId,
            comment: comment.trim(),
          });
        }
      } else {
        // 创建新评论
        if (onOptimisticCreate) {
          onOptimisticCreate(comment.trim(), parent_id);
        } else {
          // 乐观插入：全局匹配所有分页 key（在父评论所在页插入；顶层仅第一页插入）
          const tempId = -Date.now();
          const optimisticItem: any = {
            comment_id: tempId,
            comment: comment.trim(),
            children: [],
            user_id: user?.user_id ?? 0,
            username: user?.username ?? "Me",
            avatar_url: user?.avatar_url ?? "/images/default-avatar.png",
            city: user?.city ?? "",
            user_role: user?.role ?? "user",
            created_at: new Date().toISOString(),
            updated_at: null,
          };
          await mutate(
            (key: any) =>
              typeof key === "string" &&
              (key.startsWith(`/blog/get-blog-comment-lists/${targetId}`) ||
                key.startsWith(`/board/get-board-comment-lists/${targetId}`)),
            (current: any, key?: string) => {
              const base = current?.success ? current.data : current;
              if (!base) return current;
              let nextComments = base.comments || [];
              if (parent_id) {
                const tryInsert = (items: any[]): [any[], boolean] => {
                  let inserted = false;
                  const mapped = items.map((c: any) => {
                    if (c.comment_id === parent_id) {
                      const children = Array.isArray(c.children)
                        ? c.children
                        : [];
                      inserted = true;
                      return { ...c, children: [optimisticItem, ...children] };
                    }
                    if (Array.isArray(c.children) && c.children.length > 0) {
                      const [kids, added] = tryInsert(c.children);
                      if (added) inserted = true;
                      return { ...c, children: kids };
                    }
                    return c;
                  });
                  return [mapped, inserted];
                };
                const [mapped, inserted] = tryInsert(nextComments);
                nextComments = mapped;
                if (!inserted && key && key.includes("cursor=null")) {
                  nextComments = [optimisticItem, ...nextComments];
                }
              } else {
                if (key && key.includes("cursor=null")) {
                  nextComments = [optimisticItem, ...nextComments];
                }
              }
              const next = { ...base, comments: nextComments };
              return current?.success ? { ...current, data: next } : next;
            },
            false
          );
        }

        if (type === CommentType.BLOG) {
          await blogService.createBlogComment({
            blog_id: targetId,
            parent_id,
            comment: comment.trim(),
          });
        } else {
          await boardService.createBoardComment({
            board_id: targetId,
            parent_id,
            comment: comment.trim(),
          });
        }
      }

      setComment("");

      // 触发后台校验，确保与后端一致（会替换临时数据为真实数据）
      mutate(commentListKey);

      // 调用完成回调（用于编辑和回复模式）
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      // 出错时强制重新获取，回滚乐观更新
      const targetId = getTargetId();
      const commentListKey =
        type === CommentType.BLOG
          ? `/blog/get-blog-comment-lists/${targetId}?limit=10&cursor=null`
          : `/board/get-board-comment-lists/${targetId}?limit=10&cursor=null`;
      mutate(commentListKey);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取翻译文本
  const getTranslation = (key: string) => {
    return commentT(key);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative space-y-4"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <InputField
          type="textarea"
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={getTranslation("inputPlaceholder")}
          disabled={!isAuthenticated}
          rows={5}
        />
        <motion.div
          className="absolute bottom-3 right-3 text-xs text-foreground-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {comment.length}/500
        </motion.div>
      </motion.div>

      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div
          className="flex items-center text-sm text-foreground-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {!isAuthenticated && (
            <motion.div
              className="flex items-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: 0.4,
                type: "spring",
                stiffness: 200,
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-1 text-warning-500" />
              <span>{getTranslation("loginRequired")}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {(isEdited || parent_id) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Button
                onClick={() => {
                  setComment(initialComment || "");
                  if (onCancel) {
                    onCancel();
                  }
                }}
                variant="outline"
                size="sm"
                className="text-foreground-300 hover:text-foreground-200 bg-background-200 hover:bg-background-300 border-border-200"
              >
                {getTranslation("cancel")}
              </Button>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={!isAuthenticated || !comment.trim()}
              loading={isSubmitting}
              loadingText={getTranslation("submitting")}
              variant="primary"
              size="md"
            >
              {isEdited ? getTranslation("update") : getTranslation("submit")}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CommentTextInput;
