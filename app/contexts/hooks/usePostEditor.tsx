"use client";

import { useState, useEffect } from "react";
import { JSONContent } from "@tiptap/react";
import useSWR from "swr";
import toast from "react-hot-toast";
import blogService from "@/app/lib/services/blogService";

export interface BlogMetaData {
  selectedSeoId: number | null;
  selectedCoverImageId: number | null;
  selectedCoverImageUrl: string | null;
  selectedSectionId: number | null;
  selectedTags: number[];
  title: string;
  description: string;
}

export interface UsePostEditorProps {
  type: string | null;
  blogSlug: string | null;
  content: JSONContent | null;
  setContent: (content: JSONContent | null) => void;
}

export interface UsePostEditorReturn {
  blogMetaData: BlogMetaData;
  isBlogLoading: boolean;
  handleBlogMetaDataSave: (data: BlogMetaData) => void;
  handleBlogSave: () => Promise<void>;
  validateBlogData: () => { isValid: boolean; missingFields: string[] };
}

const initialBlogMetaData: BlogMetaData = {
  selectedSeoId: null,
  selectedCoverImageId: null,
  selectedCoverImageUrl: null,
  selectedSectionId: null,
  selectedTags: [],
  title: "",
  description: "",
};

export const usePostEditor = ({
  type,
  blogSlug,
  content,
  setContent,
}: UsePostEditorProps): UsePostEditorReturn => {
  const [blogMetaData, setBlogMetaData] =
    useState<BlogMetaData>(initialBlogMetaData);

  // 在更新模式下获取博客详情
  const shouldFetchBlog = type === "update" && !!blogSlug;

  const { data: blogDetails, isLoading: isBlogLoading } = useSWR(
    shouldFetchBlog ? `/blog/get-blog-details/${blogSlug}?is_editor=true` : null
  );

  // 验证博客数据
  const validateBlogData = (): {
    isValid: boolean;
    missingFields: string[];
  } => {
    const missingFields: string[] = [];

    if (!blogMetaData.selectedSeoId) missingFields.push("SEO设置");
    if (!blogMetaData.selectedCoverImageId) missingFields.push("封面图片");
    if (!blogMetaData.selectedSectionId) missingFields.push("栏目选择");
    if (!blogMetaData.title) missingFields.push("标题");
    if (!blogMetaData.description) missingFields.push("描述");

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  };

  // 当博客数据加载完成时，预填充表单
  useEffect(() => {
    if (blogDetails && type === "update") {
      const blogData = blogDetails;

      // 解析 JSON 内容
      let parsedContent: JSONContent | null;

      // 检查 chinese_content 是否存在且不为 undefined
      if (
        blogData.chinese_content &&
        blogData.chinese_content !== "undefined"
      ) {
        try {
          // 如果后端返回的是字符串，需要解析
          if (typeof blogData.chinese_content === "string") {
            parsedContent = JSON.parse(blogData.chinese_content);
          } else {
            // 如果已经是对象，直接使用
            parsedContent = blogData.chinese_content;
          }
        } catch (error) {
          console.error("Failed to parse chinese_content:", error);
          console.log("Raw chinese_content:", blogData.chinese_content);
          parsedContent = null;
        }
      } else {
        // 如果没有内容，设置为 null 以显示占位符
        parsedContent = null;
      }

      setContent(parsedContent);

      // 设置博客元数据
      setBlogMetaData({
        selectedSeoId: blogData.seo_id || null,
        selectedCoverImageId: blogData.cover_id || null,
        selectedCoverImageUrl: blogData.cover_url || null,
        selectedSectionId: blogData.section_id || null,
        selectedTags: blogData.blog_tags?.map((tag: any) => tag.tag_id) || [],
        title: blogData.chinese_title || "",
        description: blogData.chinese_description || "",
      });
    }
  }, [blogDetails, type, setContent]);

  const handleBlogMetaDataSave = (data: BlogMetaData) => {
    setBlogMetaData(data);
  };

  const handleBlogSave = async (): Promise<void> => {
    try {
      // 创建新博客
      if (type === "blog" && !blogSlug) {
        const validation = validateBlogData();
        if (!validation.isValid) {
          toast.error(
            `请填写以下必填字段：${validation.missingFields.join("、")}`
          );
          return;
        }

        // 将JSONContent转换为字符串
        const contentString = JSON.stringify(content);

        // blogService.createBlog 已经处理了 toast 显示
        await blogService.createBlog({
          section_id: blogMetaData.selectedSectionId!,
          seo_id: blogMetaData.selectedSeoId!,
          chinese_title: blogMetaData.title,
          chinese_description: blogMetaData.description,
          chinese_content: contentString,
          cover_id: blogMetaData.selectedCoverImageId!,
          blog_tags: blogMetaData.selectedTags,
        });
      }

      // 更新已有博客
      else if (type === "update" && blogSlug) {
        const validation = validateBlogData();
        if (!validation.isValid) {
          toast.error(
            `请填写以下必填字段：${validation.missingFields.join("、")}`
          );
          return;
        }

        // 将JSONContent转换为字符串
        const contentString = JSON.stringify(content);

        // blogService.updateBlog 已经处理了 toast 显示
        await blogService.updateBlog({
          blog_slug: blogSlug,
          chinese_title: blogMetaData.title,
          chinese_description: blogMetaData.description,
          chinese_content: contentString,
        });
      }
    } catch (error: any) {
      // blogService 中的 handleToastResponse 已经处理了 toast 显示
      // 这里只记录错误用于调试
      console.error("Blog save failed:", error);
    }
  };

  return {
    blogMetaData,
    isBlogLoading,
    handleBlogMetaDataSave,
    handleBlogSave,
    validateBlogData,
  };
};
