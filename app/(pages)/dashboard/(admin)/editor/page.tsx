"use client";

import useSWR from "swr";

import React, { useState, useEffect } from "react";
import { JSONContent } from "@tiptap/react";
import { motion } from "motion/react";
import { Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import useSection from "@/app/contexts/hooks/useSection";
import { useProjectEditor } from "@/app/contexts/hooks/useProjectEditor";
import { usePostEditor } from "@/app/contexts/hooks/usePostEditor";
import type { SectionListItem } from "@/app/types/sectionServiceType";
import type { GetSeoItemResponse } from "@/app/types/seoServiceType";
import { BlogMetaData } from "@/app/components/(feature)/editor/BlogMetaData";
import { ProjectMetaData } from "@/app/components/(feature)/editor/ProjectMetaData";
import TiptapEditor from "@/app/components/(feature)/editor/TiptapEditor";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";

export default function EditorPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const sectionId = searchParams.get("section_id");
  const projectSlug = searchParams.get("projectSlug");
  const blogSlug = searchParams.get("blogSlug");
  const { sections } = useSection();
  const projectSectionId = sections?.find(
    (section: SectionListItem) => section.type === "project"
  )?.section_id;
  const [currentSeoPage, setCurrentSeoPage] = useState<number>(1);
  const [allSeoItems, setAllSeoItems] = useState<GetSeoItemResponse[]>([]);
  const [hasMoreSeo, setHasMoreSeo] = useState<boolean>(false);
  const [content, setContent] = useState<JSONContent | null>(null);

  // 获取 SEO 列表
  const {
    data: seoLists,
    isLoading: isSeoLoading,
    error: seoError,
    mutate: refreshSeoLists,
  } = useSWR([
    `/seo/admin/get-seo-lists?page=${currentSeoPage}&size=20`,
    locale,
  ]);

  // 处理 SEO 列表加载更多
  const handleLoadMoreSeo = () => {
    setCurrentSeoPage((prev) => prev + 1);
  };

  // 当 SEO 数据更新时，累积到 allSeoItems 中
  useEffect(() => {
    if (seoLists?.items) {
      if (currentSeoPage === 1) {
        // 第一页，直接设置
        setAllSeoItems(seoLists.items);
      } else {
        // 后续页面，累积添加
        setAllSeoItems((prev) => [...prev, ...seoLists.items]);
      }

      // 检查是否还有更多数据
      setHasMoreSeo(seoLists.pagination?.has_next || false);
    }
  }, [seoLists, currentSeoPage]);

  // 使用项目编辑 Hook
  const {
    projectMetaData,
    isProjectLoading,
    handleProjectMetaDataSave,
    handleProjectSave,
  } = useProjectEditor({
    type,
    projectSlug,
    sectionId,
    projectSectionId,
    content,
    setContent,
  });

  // 使用博客编辑 Hook
  const {
    blogMetaData,
    isBlogLoading,
    handleBlogMetaDataSave,
    handleBlogSave,
  } = usePostEditor({
    type,
    blogSlug,
    content,
    setContent,
  });

  const items = allSeoItems;

  const handleContentChange = (json: JSONContent) => {
    setContent(json);
    // 可以在这里添加其他逻辑，比如自动保存到后端
  };

  const handleSave = async () => {
    try {
      // 处理项目保存
      if (type === "project" || (type === "update" && projectSlug)) {
        console.log("Saving project...");
        await handleProjectSave();
        return;
      }

      // 处理博客保存
      if (type === "blog" || (type === "update" && blogSlug)) {
        console.log("Saving blog...");
        await handleBlogSave();
        return;
      }

      console.log("No matching save condition found");
    } catch (error: unknown) {
      console.error("Save failed:", error);
    }
  };

  // 在更新模式下显示加载状态
  if (type === "update" && projectSlug && isProjectLoading) {
    return (
      <LoadingSpinner
        message="加载项目数据中..."
        size="lg"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  if (type === "update" && blogSlug && isBlogLoading) {
    return (
      <LoadingSpinner
        message="加载博客数据中..."
        size="lg"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header Section */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-1 sm:mb-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground-50 mb-2 sm:mb-3">
              内容编辑器
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-foreground-300 leading-relaxed break-words">
              {type === "update"
                ? "编辑和更新现有内容"
                : "创建新的博客文章或项目内容"}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleSave}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors text-sm sm:text-base"
            >
              <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="sm:inline">保存</span>
            </button>
          </div>
        </div>
      </div>

      {/* Meta Data Section */}
      {type === "blog" && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <BlogMetaData
            seoItems={items || []}
            loading={isSeoLoading}
            error={seoError}
            hasMore={hasMoreSeo}
            onLoadMore={handleLoadMoreSeo}
            onSave={handleBlogMetaDataSave}
            onSeoListRefresh={refreshSeoLists}
            initialData={blogMetaData}
            type="blog"
          />
        </div>
      )}
      {type === "project" && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <ProjectMetaData
            seoItems={items || []}
            loading={isSeoLoading}
            error={seoError}
            hasMore={hasMoreSeo}
            onLoadMore={handleLoadMoreSeo}
            onSave={handleProjectMetaDataSave}
            onSeoListRefresh={refreshSeoLists}
          />
        </div>
      )}
      {type === "update" && blogSlug && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <BlogMetaData
            seoItems={items || []}
            loading={isSeoLoading}
            error={seoError}
            hasMore={hasMoreSeo}
            onLoadMore={handleLoadMoreSeo}
            onSave={handleBlogMetaDataSave}
            onSeoListRefresh={refreshSeoLists}
            initialData={blogMetaData}
            type="update"
          />
        </div>
      )}
      {type === "update" && projectSlug && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <ProjectMetaData
            seoItems={items || []}
            loading={isSeoLoading}
            error={seoError}
            hasMore={hasMoreSeo}
            onLoadMore={handleLoadMoreSeo}
            onSave={handleProjectMetaDataSave}
            onSeoListRefresh={refreshSeoLists}
            initialData={projectMetaData}
          />
        </div>
      )}

      {/* Editor Section */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TiptapEditor content={content} onChange={handleContentChange} />
        </motion.div>
      </div>
    </div>
  );
}
