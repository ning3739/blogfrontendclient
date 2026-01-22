"use client";

import { Check, ChevronDown, ChevronUp, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import CreateSeoModal from "@/app/components/(feature)/editor/CreateSeoModal";
import CreateTagModal from "@/app/components/(feature)/editor/CreateTagModal";
import ImagePickerModal from "@/app/components/(feature)/editor/ImagePickerModal";
import { Button } from "@/app/components/ui/button/Button";
import BaseCard from "@/app/components/ui/card/BaseCard";
import MultiSelectDropdown from "@/app/components/ui/dropdown/MultiSelectDropdown";
import SearchableDropdown from "@/app/components/ui/dropdown/SearchableDropdown";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import type { BlogMetaData as BlogMetaDataType } from "@/app/hooks/usePostEditor";
import useSection from "@/app/hooks/useSection";
import type { SectionListResponse } from "@/app/types/sectionServiceType";
import type { GetSeoItemResponse } from "@/app/types/seoServiceType";

interface BlogMetaDataProps {
  seoItems: GetSeoItemResponse[];
  loading: boolean;
  error: unknown;
  hasMore: boolean;
  onLoadMore: () => void;
  onSave: (data: BlogMetaDataType) => void;
  onSeoListRefresh: () => void;
  initialData?: BlogMetaDataType;
  type?: "blog" | "update";
  isSaving?: boolean;
}

export const BlogMetaData = ({
  seoItems,
  loading,
  error,
  hasMore,
  onLoadMore,
  onSave,
  onSeoListRefresh,
  initialData,
  type = "blog",
  isSaving = false,
}: BlogMetaDataProps) => {
  // Form state
  const [selectedSeoId, setSelectedSeoId] = useState<number | null>(null);
  const [selectedCoverImageId, setSelectedCoverImageId] = useState<number | null>(null);
  const [selectedCoverImageUrl, setSelectedCoverImageUrl] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Tag pagination
  const [currentTagPage, setCurrentTagPage] = useState(1);
  const [allTagItems, setAllTagItems] = useState<Array<{ tag_id: number; title: string }>>([]);
  const [hasMoreTag, setHasMoreTag] = useState(false);

  // Modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCreateSeoModalOpen, setIsCreateSeoModalOpen] = useState(false);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const prevInitialDataRef = useRef<string | null>(null);

  const { sections } = useSection();
  const sectionLists = sections?.find(
    (s: SectionListResponse) => s.type === "blog" && (s?.children?.length ?? 0) > 0,
  )?.children;

  const {
    data: tagLists,
    isLoading: isTagLoading,
    mutate: refreshTagLists,
  } = useSWR(`/tag/get-tag-lists?page=${currentTagPage}&size=10&published_only=false`);

  // Initialize from initialData
  useEffect(() => {
    if (!initialData) return;

    const dataString = JSON.stringify({
      seoId: initialData.selectedSeoId,
      coverImageId: initialData.selectedCoverImageId,
      coverImageUrl: initialData.selectedCoverImageUrl,
      sectionId: initialData.selectedSectionId,
      title: initialData.title,
      description: initialData.description,
      tags: initialData.selectedTags,
    });

    if (prevInitialDataRef.current !== dataString) {
      prevInitialDataRef.current = dataString;
      setSelectedSeoId(initialData.selectedSeoId ?? null);
      setSelectedCoverImageId(initialData.selectedCoverImageId ?? null);
      setSelectedCoverImageUrl(initialData.selectedCoverImageUrl ?? null);
      setSelectedSectionId(initialData.selectedSectionId ?? null);
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
      setSelectedTags(initialData.selectedTags ?? []);
    }
  }, [initialData]);

  // Accumulate tag items
  useEffect(() => {
    if (tagLists?.items) {
      setAllTagItems((prev) =>
        currentTagPage === 1 ? tagLists.items : [...prev, ...tagLists.items],
      );
      setHasMoreTag(tagLists.pagination?.has_next || false);
    }
  }, [tagLists, currentTagPage]);

  // Auto-load more tags in update mode if selected tags are missing
  const handleLoadMoreTag = useCallback(() => setCurrentTagPage((p) => p + 1), []);

  useEffect(() => {
    if (
      type === "update" &&
      selectedTags.length > 0 &&
      allTagItems.length > 0 &&
      hasMoreTag &&
      !isTagLoading
    ) {
      const missingTags = selectedTags.filter((id) => !allTagItems.some((t) => t?.tag_id === id));
      if (missingTags.length > 0) handleLoadMoreTag();
    }
  }, [type, selectedTags, allTagItems, hasMoreTag, isTagLoading, handleLoadMoreTag]);

  // Loading states
  if (loading)
    return <LoadingSpinner message="正在加载博客元数据..." size="md" variant="wave" fullScreen />;
  if (error) return <ErrorDisplay message="加载博客元数据失败" type="error" />;
  if (!seoItems) return <ErrorDisplay message="未找到博客元数据" type="notFound" />;
  if (isTagLoading && allTagItems.length === 0) {
    return <LoadingSpinner message="正在加载标签..." size="md" variant="wave" fullScreen />;
  }

  // Transform data for dropdowns
  const seoDropdownItems = seoItems.map((item) => ({
    id: item.seo_id,
    title: item.title,
    description: item.description,
    extra: `关键词: ${item.keywords}`,
  }));

  const sectionDropdownItems = (sectionLists || []).map((item: SectionListResponse) => ({
    id: item.section_id,
    title: item.title || "未知栏目",
  }));

  const tagDropdownItems = allTagItems.map((item) => ({
    id: item.tag_id,
    title: item.title || "未知标签",
  }));

  // Handlers
  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) return prev.filter((id) => id !== tagId);
      return prev.length >= 3 ? prev : [...prev, tagId];
    });
  };

  const handleTagRemove = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  const handleImageSelect = (mediaId: number, url: string) => {
    setSelectedCoverImageId(mediaId);
    setSelectedCoverImageUrl(url);
    setIsImageModalOpen(false);
  };

  const handleCreateSeoSuccess = (seoId: number) => {
    onSeoListRefresh?.();
    setSelectedSeoId(seoId);
  };

  const handleCreateTagSuccess = (tagId: number) => {
    refreshTagLists?.();
    setSelectedTags((prev) => (prev.length >= 3 ? prev : [...prev, tagId]));
    setIsCreateTagModalOpen(false);
  };

  const handleSave = () => {
    onSave?.({
      selectedSeoId,
      selectedCoverImageId,
      selectedCoverImageUrl,
      selectedSectionId,
      selectedTags,
      title,
      description,
    });
    setIsCollapsed(true);
  };

  const isConfigured =
    selectedSeoId &&
    selectedCoverImageId &&
    selectedSectionId &&
    title.trim() &&
    description.trim() &&
    title.length <= 50 &&
    description.length <= 500;

  const canSave =
    selectedSeoId &&
    selectedCoverImageId &&
    (type !== "blog" || selectedSectionId) &&
    title.trim() &&
    description.trim() &&
    title.length <= 50 &&
    description.length <= 500;

  return (
    <div className="space-y-6">
      <BaseCard padding="lg" className="bg-card-100 shadow-md" hover={false}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-foreground-50">博客设置</h3>
            {isConfigured && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-sm bg-success-50 text-success-500 text-xs font-medium">
                <Check className="h-3 w-3" />
                <span>已配置</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-sm text-foreground-300 hover:text-foreground-50 hover:bg-background-300"
          >
            <span className="text-sm font-medium">{isCollapsed ? "展开设置" : "折叠设置"}</span>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="space-y-6 mt-6">
            {/* Section selector - only in create mode */}
            {type === "blog" && (
              <div className="space-y-3">
                <span className="block text-sm font-medium text-foreground-50">栏目</span>
                <SearchableDropdown
                  items={sectionDropdownItems}
                  selectedId={selectedSectionId}
                  onSelect={setSelectedSectionId}
                  placeholder="选择栏目"
                  searchPlaceholder="搜索栏目..."
                  emptyMessage="没有找到栏目"
                />
              </div>
            )}

            {/* SEO selector */}
            <div className="space-y-3">
              <span className="block text-sm font-medium text-foreground-50">SEO 设置</span>
              <SearchableDropdown
                items={seoDropdownItems}
                selectedId={selectedSeoId}
                onSelect={setSelectedSeoId}
                placeholder="选择 SEO 设置"
                searchPlaceholder="搜索 SEO 设置..."
                emptyMessage="没有找到匹配的 SEO 设置"
                hasMore={hasMore}
                isLoading={loading}
                onLoadMore={onLoadMore}
                loadMoreText="获取更多 SEO 设置"
                showCreate
                createText="创建新的 SEO 设置"
                onCreateClick={() => setIsCreateSeoModalOpen(true)}
              />
            </div>

            {/* Tag selector */}
            <div className="space-y-3">
              <span className="block text-sm font-medium text-foreground-50">标签</span>
              <MultiSelectDropdown
                items={tagDropdownItems}
                selectedIds={selectedTags}
                onToggle={handleTagToggle}
                onRemove={handleTagRemove}
                placeholder="选择标签"
                searchPlaceholder="搜索标签..."
                emptyMessage="暂无标签数据"
                maxItems={3}
                hasMore={hasMoreTag}
                isLoading={isTagLoading}
                onLoadMore={handleLoadMoreTag}
                loadMoreText="获取更多标签"
                showCreate
                createText="创建新标签"
                onCreateClick={() => setIsCreateTagModalOpen(true)}
              />
            </div>

            {/* Title input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="blog-title"
                  className="block text-sm font-medium text-foreground-50"
                >
                  博客标题
                </label>
                <span
                  className={`text-xs font-medium ${title.length > 50 ? "text-error-500" : "text-foreground-400"}`}
                >
                  {title.length}/50
                </span>
              </div>
              <input
                id="blog-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入博客标题"
                maxLength={50}
                className={`w-full px-4 py-3 text-sm bg-card-50 border rounded-sm text-foreground-50 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 ${
                  title.length > 50 ? "border-error-500" : "border-border-100"
                }`}
              />
              {title.length > 50 && (
                <p className="text-xs text-error-500 font-medium">标题不能超过50个字符</p>
              )}
            </div>

            {/* Description input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="blog-description"
                  className="block text-sm font-medium text-foreground-50"
                >
                  博客描述
                </label>
                <span
                  className={`text-xs font-medium ${description.length > 500 ? "text-error-500" : "text-foreground-400"}`}
                >
                  {description.length}/500
                </span>
              </div>
              <textarea
                id="blog-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入博客描述"
                rows={4}
                maxLength={500}
                className={`w-full px-4 py-3 text-sm bg-card-50 border rounded-sm text-foreground-50 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none ${
                  description.length > 500 ? "border-error-500" : "border-border-100"
                }`}
              />
              {description.length > 500 && (
                <p className="text-xs text-error-500 font-medium">描述不能超过500个字符</p>
              )}
            </div>

            {/* Cover image selector */}
            <div className="space-y-3">
              <span className="block text-sm font-medium text-foreground-50">封面图片</span>
              {selectedCoverImageUrl ? (
                <div className="relative group">
                  <div className="relative w-full h-48">
                    <Image
                      src={selectedCoverImageUrl}
                      alt="Cover"
                      fill
                      className="object-cover rounded-sm border border-border-100"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-sm flex items-center justify-center transition-opacity">
                    <Button variant="secondary" size="sm" onClick={() => setIsImageModalOpen(true)}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      更换图片
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCoverImageId(null);
                      setSelectedCoverImageUrl(null);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full h-48 border-2 border-dashed border-border-100 rounded-sm flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-foreground-400 mx-auto mb-2" />
                    <p className="text-sm text-foreground-300 font-medium">点击选择封面图片</p>
                  </div>
                </button>
              )}
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-4 border-t border-border-100">
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={!canSave || isSaving}
                loading={isSaving}
                loadingText="保存中..."
              >
                保存设置
              </Button>
            </div>
          </div>
        )}
      </BaseCard>

      {/* Modals */}
      <ImagePickerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={handleImageSelect}
      />
      <CreateSeoModal
        isOpen={isCreateSeoModalOpen}
        onClose={() => setIsCreateSeoModalOpen(false)}
        onSuccess={handleCreateSeoSuccess}
      />
      <CreateTagModal
        isOpen={isCreateTagModalOpen}
        onClose={() => setIsCreateTagModalOpen(false)}
        onSuccess={handleCreateTagSuccess}
      />
    </div>
  );
};
