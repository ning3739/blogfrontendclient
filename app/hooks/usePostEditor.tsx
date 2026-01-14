"use client";

import type { JSONContent } from "@tiptap/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import blogService from "@/app/lib/services/blogService";
import type { GetBlogEditorDetailsResponse } from "@/app/types/blogServiceType";
import type { BlogMetaData, UsePostEditorProps, UsePostEditorReturn } from "@/app/types/editorType";

// 重新导出类型供其他组件使用
export type { BlogMetaData, UsePostEditorProps, UsePostEditorReturn };

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
  const [blogMetaData, setBlogMetaData] = useState<BlogMetaData>(initialBlogMetaData);

  // 在更新模式下获取博客详情
  const shouldFetchBlog = type === "update" && !!blogSlug;

  const { data: blogDetails, isLoading: isBlogLoading } = useSWR<GetBlogEditorDetailsResponse>(
    shouldFetchBlog ? `/blog/get-blog-details/${blogSlug}?is_editor=true` : null,
  );

  // 验证博客数据
  const validateBlogData = (): {
    isValid: boolean;
    missingFields: string[];
  } => {
    const fields = [
      { value: blogMetaData.selectedSeoId, name: "SEO设置" },
      { value: blogMetaData.selectedCoverImageId, name: "封面图片" },
      { value: blogMetaData.selectedSectionId, name: "栏目选择" },
      { value: blogMetaData.title, name: "标题" },
      { value: blogMetaData.description, name: "描述" },
    ];

    const missingFields = fields.filter((f) => !f.value).map((f) => f.name);
    return { isValid: missingFields.length === 0, missingFields };
  };

  // 当博客数据加载完成时，预填充表单
  useEffect(() => {
    if (blogDetails && type === "update") {
      const blogData = blogDetails;

      // 解析并设置内容
      const parsedContent = blogData.chinese_content
        ? (blogData.chinese_content as JSONContent)
        : null;
      setContent(parsedContent);

      // 设置博客元数据
      setBlogMetaData({
        selectedSeoId: blogData.seo_id || null,
        selectedCoverImageId: blogData.cover_id || null,
        selectedCoverImageUrl: blogData.cover_url || null,
        selectedSectionId: blogData.section_id || null,
        selectedTags: blogData.blog_tags?.map((tag: { tag_id: number }) => tag.tag_id) || [],
        title: blogData.chinese_title || "",
        description: blogData.chinese_description || "",
      });
    }
  }, [blogDetails, type, setContent]);

  const handleBlogMetaDataSave = (data: BlogMetaData) => {
    setBlogMetaData(data);
  };

  const handleBlogSave = async (): Promise<void> => {
    const validation = validateBlogData();
    if (!validation.isValid) {
      toast.error(`请填写以下必填字段：${validation.missingFields.join("、")}`);
      return;
    }

    try {
      if (type === "blog" && !blogSlug) {
        const response = await blogService.createBlog({
          section_id: blogMetaData.selectedSectionId ?? 0,
          seo_id: blogMetaData.selectedSeoId ?? 0,
          chinese_title: blogMetaData.title,
          chinese_description: blogMetaData.description,
          chinese_content: content || { type: "doc", content: [] },
          cover_id: blogMetaData.selectedCoverImageId ?? 0,
          blog_tags: blogMetaData.selectedTags,
        });

        const message = "message" in response ? response.message : "Blog created successfully";
        const error = "error" in response ? response.error : "Failed to create blog";
        response.status === 200 ? toast.success(message) : toast.error(error);
      }

      // 更新已有博客
      else if (type === "update" && blogSlug) {
        const response = await blogService.updateBlog({
          blog_slug: blogSlug,
          seo_id: blogMetaData.selectedSeoId ?? 0,
          cover_id: blogMetaData.selectedCoverImageId ?? 0,
          chinese_title: blogMetaData.title,
          chinese_description: blogMetaData.description,
          chinese_content: content || { type: "doc", content: [] },
          blog_tags: blogMetaData.selectedTags,
        });

        const message = "message" in response ? response.message : "Blog updated successfully";
        const error = "error" in response ? response.error : "Failed to update blog";
        response.status === 200 ? toast.success(message) : toast.error(error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save blog";
      toast.error(errorMessage);
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
