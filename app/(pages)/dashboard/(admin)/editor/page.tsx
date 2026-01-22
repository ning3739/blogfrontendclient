"use client";

import type { JSONContent } from "@tiptap/react";
import { Save } from "lucide-react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { BlogMetaData } from "@/app/components/(feature)/editor/BlogMetaData";
import { ProjectMetaData } from "@/app/components/(feature)/editor/ProjectMetaData";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import { usePostEditor } from "@/app/hooks/usePostEditor";
import { useProjectEditor } from "@/app/hooks/useProjectEditor";
import useSection from "@/app/hooks/useSection";
import type { SectionListItem } from "@/app/types/sectionServiceType";
import type { GetSeoItemResponse } from "@/app/types/seoServiceType";

const TiptapEditor = dynamic(() => import("@/app/components/(feature)/editor/TiptapEditor"), {
  loading: () => (
    <div className="bg-card-50 border border-border-50 rounded-sm shadow-sm p-8 min-h-[500px] flex items-center justify-center">
      <LoadingSpinner message="加载编辑器..." size="md" variant="wave" />
    </div>
  ),
  ssr: false,
});

export default function EditorPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const sectionId = searchParams.get("section_id");
  const projectSlug = searchParams.get("projectSlug");
  const blogSlug = searchParams.get("blogSlug");
  const { sections } = useSection();
  const projectSectionId = sections?.find(
    (section: SectionListItem) => section.type === "project",
  )?.section_id;
  const [currentSeoPage, setCurrentSeoPage] = useState<number>(1);
  const [allSeoItems, setAllSeoItems] = useState<GetSeoItemResponse[]>([]);
  const [hasMoreSeo, setHasMoreSeo] = useState<boolean>(false);
  const [content, setContent] = useState<JSONContent | null>(null);

  const {
    data: seoLists,
    isLoading: isSeoLoading,
    error: seoError,
    mutate: refreshSeoLists,
  } = useSWR([`/seo/admin/get-seo-lists?page=${currentSeoPage}&size=20`, locale]);

  const handleLoadMoreSeo = () => {
    setCurrentSeoPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (seoLists?.items) {
      if (currentSeoPage === 1) {
        setAllSeoItems(seoLists.items);
      } else {
        setAllSeoItems((prev) => [...prev, ...seoLists.items]);
      }

      setHasMoreSeo(seoLists.pagination?.has_next || false);
    }
  }, [seoLists, currentSeoPage]);

  const {
    projectMetaData,
    isProjectLoading,
    isSaving: isProjectSaving,
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

  const {
    blogMetaData,
    isBlogLoading,
    isSaving: isBlogSaving,
    handleBlogMetaDataSave,
    handleBlogSave,
  } = usePostEditor({
    type,
    blogSlug,
    content,
    setContent,
  });

  const isSaving = isBlogSaving || isProjectSaving;

  const items = allSeoItems;

  const handleContentChange = (json: JSONContent) => {
    setContent(json);
  };

  const handleSave = async () => {
    try {
      if (type === "project" || (type === "update" && projectSlug)) {
        await handleProjectSave();
        return;
      }

      if (type === "blog" || (type === "update" && blogSlug)) {
        await handleBlogSave();
        return;
      }
    } catch (_error: unknown) {
      // 错误已经在各自的 handler 中处理
    }
  };

  // 在更新模式下显示加载状态
  if (type === "update" && projectSlug && isProjectLoading) {
    return (
      <LoadingSpinner message="加载项目数据中..." size="lg" variant="wave" fullScreen={true} />
    );
  }

  if (type === "update" && blogSlug && isBlogLoading) {
    return (
      <LoadingSpinner message="加载博客数据中..." size="lg" variant="wave" fullScreen={true} />
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
            <p className="text-xs sm:text-sm lg:text-base text-foreground-300 leading-relaxed wrap-break-word">
              {type === "update" ? "编辑和更新现有内容" : "创建新的博客文章或项目内容"}
            </p>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-sm hover:bg-primary-600 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span className="sm:inline">保存中...</span>
                </>
              ) : (
                <>
                  <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="sm:inline">保存</span>
                </>
              )}
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
            isSaving={isBlogSaving}
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
            isSaving={isProjectSaving}
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
            isSaving={isBlogSaving}
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
            isSaving={isProjectSaving}
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
