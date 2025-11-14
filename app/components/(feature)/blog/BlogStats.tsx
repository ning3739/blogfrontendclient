"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { useAuth } from "@/app/contexts/hooks/useAuth";
import { Eye, Heart, MessageCircle, Bookmark } from "lucide-react";
import type { GetBlogStatsResponse } from "@/app/types/blogServiceType";
import blogService from "@/app/lib/services/blogService";
import { isBlogLiked, setBlogLikeStatus } from "@/app/lib/utils/cookieUtils";

const BlogStats = ({
  blogId,
  isSaved: initialIsSaved,
}: {
  blogId: number;
  isSaved: boolean;
}) => {
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { data, isLoading, error, mutate } = useSWR<GetBlogStatsResponse>(
    `/blog/get-blog-stats/${blogId}`
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
        } else if (response.data === false) {
          // 取消保存，切换保存状态
          setIsSaved(false);
        }
        // 无论保存还是取消保存，都重新获取统计数据以更新收藏数
        mutate();
      }
    } catch (error) {
      console.error("Failed to save blog:", error);
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
        } else if (response.data === false) {
          // 取消点赞，更新状态和 cookie
          setIsLiked(false);
          setBlogLikeStatus(blogId, false);
        }
        // 无论点赞还是取消点赞，都重新获取统计数据以更新点赞数
        mutate();
      }
    } catch (error) {
      console.error("Failed to like blog:", error);
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-pulse flex space-x-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
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
    { icon: Eye, value: data.views, clickable: false },
    {
      icon: Heart,
      value: data.likes,
      clickable: true, // 未登录用户也可以点赞
      isActive: isLiked,
    },
    {
      icon: MessageCircle,
      value: data.comments,
      clickable: false,
    },
    {
      icon: Bookmark,
      value: data.saves,
      clickable: isAuthenticated,
      isActive: isSaved,
    },
  ];

  return (
    <div className="flex justify-center items-center space-x-8 py-4">
      {stats.map(({ icon: Icon, value, clickable, isActive }, index) => {
        const handleClick = () => {
          if (index === 1) {
            // 点赞按钮 (Heart icon)
            handleLikeBlog();
          } else if (index === 3) {
            // 收藏按钮 (Bookmark icon)
            handleSaveBlog();
          }
        };

        return (
          <div
            key={index}
            className={`flex items-center space-x-2 text-foreground-200 transition-colors duration-200 ${
              clickable
                ? "hover:text-foreground-100 cursor-pointer hover:scale-105"
                : "opacity-60 cursor-not-allowed"
            } ${
              (isSaving || isLiking) && clickable
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={clickable ? handleClick : undefined}
          >
            <Icon
              className={`w-4 h-4 ${
                (isSaving || isLiking) && clickable ? "animate-pulse" : ""
              } ${isActive ? "text-primary-500 fill-primary-500" : ""}`}
              strokeWidth={2}
            />
            <span className="text-sm font-medium text-foreground-100">
              {value}
            </span>
            {/* label removed by design */}
          </div>
        );
      })}
    </div>
  );
};

export default BlogStats;
