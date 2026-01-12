"use client";

import { Bookmark, Eye, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { useAuth } from "@/app/hooks/useAuth";
import blogService from "@/app/lib/services/blogService";
import { isBlogLiked, setBlogLikeStatus } from "@/app/lib/utils/cookieUtils";
import type { GetBlogStatsResponse } from "@/app/types/blogServiceType";

const BlogStats = ({ blogId, isSaved: initialIsSaved }: { blogId: number; isSaved: boolean }) => {
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { data, isLoading, error, mutate } = useSWR<GetBlogStatsResponse>(
    `/blog/get-blog-stats/${blogId}`,
  );

  // 同步外部传入的 isSaved 状态
  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  // 从 cookie 读取初始点赞状态
  useEffect(() => {
    setIsLiked(isBlogLiked(blogId));
  }, [blogId]);

  const handleSaveBlog = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const response = await blogService.saveBlogButton({ blog_id: blogId });

      if (response.status === 200 && "data" in response) {
        if (response.data === true) {
          // 保存成功，切换保存状态
          setIsSaved(true);
          toast.success("message" in response ? response.message : "Blog saved");
        } else if (response.data === false) {
          // 取消保存，切换保存状态
          setIsSaved(false);
          toast.success("message" in response ? response.message : "Blog unsaved");
        }
        // 无论保存还是取消保存，都重新获取统计数据以更新收藏数
        mutate();
      } else {
        toast.error("error" in response ? response.error : "Failed to save blog");
      }
    } catch (error) {
      console.error("Failed to save blog:", error);
      toast.error("Failed to save blog");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLikeBlog = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await blogService.likeBlogButton({ blog_id: blogId });

      if (response.status === 200 && "data" in response) {
        if (response.data === true) {
          // 点赞成功，更新状态和 cookie
          setIsLiked(true);
          setBlogLikeStatus(blogId, true);
          toast.success("message" in response ? response.message : "Blog liked");
        } else if (response.data === false) {
          // 取消点赞，更新状态和 cookie
          setIsLiked(false);
          setBlogLikeStatus(blogId, false);
          toast.success("message" in response ? response.message : "Blog unliked");
        }
        // 无论点赞还是取消点赞，都重新获取统计数据以更新点赞数
        mutate();
      } else {
        toast.error("error" in response ? response.error : "Failed to like blog");
      }
    } catch (error) {
      console.error("Failed to like blog:", error);
      toast.error("Failed to like blog");
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-pulse flex space-x-8">
          {[0, 1, 2, 3].map((skeletonId) => (
            <div key={`skeleton-${skeletonId}`} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-background-300 rounded"></div>
              <div className="w-8 h-4 bg-background-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null; // 静默处理错误，不显示错误信息
  }

  if (!data) {
    return null; // 静默处理无数据情况
  }

  const stats = [
    { icon: Eye, value: data.views, clickable: false, label: "views" },
    {
      icon: Heart,
      value: data.likes,
      clickable: true, // 未登录用户也可以点赞
      isActive: isLiked,
      label: "likes",
    },
    {
      icon: MessageCircle,
      value: data.comments,
      clickable: false,
      label: "comments",
    },
    {
      icon: Bookmark,
      value: data.saves,
      clickable: isAuthenticated,
      isActive: isSaved,
      label: "saves",
    },
  ];

  return (
    <div className="flex justify-center items-center space-x-8 py-4">
      {stats.map(({ icon: Icon, value, clickable, isActive, label }) => {
        const handleClick = () => {
          if (label === "likes") {
            handleLikeBlog();
          } else if (label === "saves") {
            handleSaveBlog();
          }
        };

        return (
          <button
            type="button"
            key={`stat-${label}`}
            disabled={!clickable || (clickable && (isSaving || isLiking))}
            className={`flex items-center space-x-2 text-foreground-200 transition-colors duration-200 ${
              clickable
                ? "hover:text-foreground-100 cursor-pointer hover:scale-105"
                : "opacity-60 cursor-not-allowed"
            } ${(isSaving || isLiking) && clickable ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={clickable ? handleClick : undefined}
          >
            <Icon
              className={`w-4 h-4 ${
                (isSaving || isLiking) && clickable ? "animate-pulse" : ""
              } ${isActive ? "text-primary-500 fill-primary-500" : ""}`}
              strokeWidth={2}
            />
            <span className="text-sm font-medium text-foreground-100">{value}</span>
            {/* label removed by design */}
          </button>
        );
      })}
    </div>
  );
};

export default BlogStats;
