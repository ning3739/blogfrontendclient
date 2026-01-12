"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Plus,
  Search,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import CreateSeoModal from "@/app/components/(feature)/editor/CreateSeoModal";
import CreateTagModal from "@/app/components/(feature)/editor/CreateTagModal";
import ImagePickerModal from "@/app/components/(feature)/editor/ImagePickerModal";
import { Button } from "@/app/components/ui/button/butten";
import Card from "@/app/components/ui/card/Card";
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
}: BlogMetaDataProps) => {
  const [selectedSeoId, setSelectedSeoId] = useState<number | null>(null);
  const [selectedCoverImageId, setSelectedCoverImageId] = useState<number | null>(null);
  const [selectedCoverImageUrl, setSelectedCoverImageUrl] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [currentTagPage, setCurrentTagPage] = useState<number>(1);
  const [allTagItems, setAllTagItems] = useState<Array<{ tag_id: number; title: string }>>([]);
  const [hasMoreTag, setHasMoreTag] = useState<boolean>(false);

  const { sections } = useSection();

  const sectionLists = sections?.find(
    (section: SectionListResponse) =>
      section.type === "blog" && (section?.children?.length ?? 0) > 0,
  )?.children;

  const {
    data: tagLists,
    isLoading: isTagLoading,
    mutate: refreshTagLists,
  } = useSWR(`/tag/get-tag-lists?page=${currentTagPage}&size=10&published_only=false`);

  // Modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSeoDropdownOpen, setIsSeoDropdownOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [isCreateSeoModalOpen, setIsCreateSeoModalOpen] = useState(false);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Search states
  const [seoSearchTerm, setSeoSearchTerm] = useState("");
  const [tagSearchTerm, setTagSearchTerm] = useState("");

  const seoDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const sectionDropdownRef = useRef<HTMLDivElement>(null);
  const initialDataLoadedRef = useRef<boolean>(false);
  const prevInitialDataRef = useRef<string | null>(null);

  // 当 initialData 更新时，更新所有状态（仅在初始加载或数据真正变化时）
  useEffect(() => {
    if (initialData) {
      // 使用 JSON.stringify 比较数据是否真正变化
      const currentDataString = JSON.stringify({
        seoId: initialData.selectedSeoId,
        coverImageId: initialData.selectedCoverImageId,
        coverImageUrl: initialData.selectedCoverImageUrl,
        sectionId: initialData.selectedSectionId,
        title: initialData.title,
        description: initialData.description,
        tags: initialData.selectedTags,
      });

      // 只有在数据真正变化时才更新状态
      if (prevInitialDataRef.current !== currentDataString) {
        prevInitialDataRef.current = currentDataString;
        setSelectedSeoId(initialData.selectedSeoId ?? null);
        setSelectedCoverImageId(initialData.selectedCoverImageId ?? null);
        setSelectedCoverImageUrl(initialData.selectedCoverImageUrl ?? null);
        setSelectedSectionId(initialData.selectedSectionId ?? null);
        setTitle(initialData.title ?? "");
        setDescription(initialData.description ?? "");
        setSelectedTags(initialData.selectedTags ?? []);
        initialDataLoadedRef.current = true;
      }
    }
  }, [initialData]);

  const handleLoadMoreTag = useCallback(() => {
    setCurrentTagPage((prev) => prev + 1);
  }, []);

  // 当标签数据更新时，累积到 allTagItems 中
  useEffect(() => {
    if (tagLists?.items) {
      if (currentTagPage === 1) {
        // 第一页，直接设置
        setAllTagItems(tagLists.items);
      } else {
        // 后续页面，累积添加
        setAllTagItems((prev) => [...prev, ...tagLists.items]);
      }

      // 检查是否还有更多数据
      setHasMoreTag(tagLists.pagination?.has_next || false);
    }
  }, [tagLists, currentTagPage]);

  // 在 update 模式下，检查是否所有 selectedTags 都在 allTagItems 中
  // 如果不在且还有更多数据，自动加载更多
  useEffect(() => {
    if (
      type === "update" &&
      selectedTags.length > 0 &&
      allTagItems.length > 0 &&
      hasMoreTag &&
      !isTagLoading
    ) {
      const missingTags = selectedTags.filter(
        (tagId) => !allTagItems.some((item) => item?.tag_id === tagId),
      );

      if (missingTags.length > 0) {
        handleLoadMoreTag();
      }
    }
  }, [type, selectedTags, allTagItems, hasMoreTag, isTagLoading, handleLoadMoreTag]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (seoDropdownRef.current && !seoDropdownRef.current.contains(event.target as Node)) {
        setIsSeoDropdownOpen(false);
        setSeoSearchTerm("");
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
        setTagSearchTerm("");
      }
      if (
        sectionDropdownRef.current &&
        !sectionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSectionDropdownOpen(false);
      }
    };

    if (isSeoDropdownOpen || isTagDropdownOpen || isSectionDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSeoDropdownOpen, isTagDropdownOpen, isSectionDropdownOpen]);

  if (loading) {
    return (
      <LoadingSpinner message="正在加载博客元数据..." size="md" variant="wave" fullScreen={true} />
    );
  }

  if (error) {
    return <ErrorDisplay message="加载博客元数据失败" type="error" />;
  }

  if (!seoItems) {
    return <ErrorDisplay message="未找到博客元数据" type="notFound" />;
  }

  // 如果标签数据还在加载中，显示加载状态
  if (isTagLoading && allTagItems.length === 0) {
    return <LoadingSpinner message="正在加载标签..." size="md" variant="wave" fullScreen={true} />;
  }

  // 过滤数据
  const filteredSeoItems = seoItems.filter(
    (item) =>
      item?.title?.toLowerCase().includes(seoSearchTerm.toLowerCase()) ||
      item?.description?.toLowerCase().includes(seoSearchTerm.toLowerCase()) ||
      item?.keywords?.toLowerCase().includes(seoSearchTerm.toLowerCase()),
  );

  const filteredTagItems = allTagItems.filter((item) =>
    item?.title?.toLowerCase().includes(tagSearchTerm.toLowerCase()),
  );

  // 栏目不需要过滤，直接使用原始数据
  const filteredSectionItems = sectionLists || [];

  // 获取选中的项目
  const selectedSeoItem = seoItems.find((item) => item?.seo_id === selectedSeoId);
  const selectedSectionItem = sectionLists?.find(
    (item: SectionListResponse) => item?.section_id === selectedSectionId,
  );

  // 在 update 模式下，通过自动加载更多标签来确保 selectedTags 中的标签都能显示
  const uniqueTagItems = allTagItems;

  const selectedTagItems = uniqueTagItems.filter((item) => selectedTags.includes(item?.tag_id));

  // 处理函数
  const handleSeoSelect = (seoId: number) => {
    setSelectedSeoId(seoId);
    setIsSeoDropdownOpen(false);
    setSeoSearchTerm("");
  };

  const handleSectionSelect = (sectionId: number) => {
    setSelectedSectionId(sectionId);
    setIsSectionDropdownOpen(false);
  };

  const handleTagToggle = (tagId: number | null | undefined) => {
    // 如果 tagId 无效，直接返回
    if (tagId === null || tagId === undefined || typeof tagId !== "number") {
      return;
    }

    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        // 如果已选中，则取消选择
        return prev.filter((id) => id !== tagId);
      } else {
        // 如果未选中，检查是否已达到最大数量限制
        if (prev.length >= 3) {
          return prev; // 已达到最大数量，不添加新标签
        }
        return [...prev, tagId];
      }
    });
  };

  const handleTagRemove = (tagId: number | null | undefined) => {
    // 如果 tagId 无效，直接返回
    if (tagId === null || tagId === undefined || typeof tagId !== "number") {
      return;
    }

    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  const handleImageSelect = (mediaId: number, url: string) => {
    setSelectedCoverImageId(mediaId);
    setSelectedCoverImageUrl(url);
    setIsImageModalOpen(false);
  };

  const handleCreateSeoSuccess = (seoId: number) => {
    if (onSeoListRefresh) {
      onSeoListRefresh();
    }
    setSelectedSeoId(seoId);
    setIsSeoDropdownOpen(false);
  };

  const handleCreateTagSuccess = (tagId: number) => {
    // 刷新标签列表
    if (refreshTagLists) {
      refreshTagLists();
    }
    // 自动选择新创建的标签（如果未达到最大数量限制）
    setSelectedTags((prev) => {
      if (prev.length >= 3) {
        return prev; // 已达到最大数量，不添加新标签
      }
      return [...prev, tagId];
    });
    setIsTagDropdownOpen(false);
    setIsCreateTagModalOpen(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        selectedSeoId,
        selectedCoverImageId,
        selectedCoverImageUrl,
        selectedSectionId,
        selectedTags,
        title,
        description,
      });
    }
    // 保存后自动折叠
    setIsCollapsed(true);
  };

  return (
    <div className="space-y-6">
      <Card padding="lg" className="bg-card-100 shadow-md" hover={false}>
        {/* 折叠/展开头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-foreground-50">博客设置</h3>
            {selectedSeoId &&
              selectedCoverImageId &&
              selectedSectionId &&
              title.trim() &&
              description.trim() &&
              title.length <= 50 &&
              description.length <= 500 && (
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

        {/* 折叠内容 */}
        {!isCollapsed && (
          <div className="space-y-6">
            {/* 栏目选择 - 仅在创建模式下显示 */}
            {type === "blog" && (
              <div className="space-y-3">
                <label
                  htmlFor="section-select"
                  className="block text-sm font-medium text-foreground-50"
                >
                  栏目
                </label>
                <div className="relative" ref={sectionDropdownRef}>
                  <button
                    type="button"
                    className="w-full rounded-sm border border-border-100 bg-card-50 px-4 py-3 text-foreground-50 cursor-pointer hover:border-border-200 hover:bg-background-300"
                    onClick={() => setIsSectionDropdownOpen(!isSectionDropdownOpen)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Search className="h-4 w-4 text-foreground-300" />
                        <span className="text-sm">
                          {selectedSectionItem
                            ? selectedSectionItem?.title || "未知栏目"
                            : "选择栏目"}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-foreground-300 ${
                          isSectionDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isSectionDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-card-50 border border-border-100 rounded-sm shadow-lg max-h-60 overflow-auto">
                      <div className="max-h-60 overflow-auto">
                        {filteredSectionItems.map((item: SectionListResponse) => (
                          <button
                            type="button"
                            key={item?.section_id}
                            className="w-full px-4 py-3 cursor-pointer hover:bg-background-300 text-left"
                            onClick={() => handleSectionSelect(item?.section_id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-foreground-50">
                                {item?.title || "未知栏目"}
                              </span>
                              {selectedSectionId === item?.section_id && (
                                <Check className="h-4 w-4 text-primary-500" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEO 选择器 */}
            <div className="space-y-3">
              <label htmlFor="seo-select" className="block text-sm font-medium text-foreground-50">
                SEO 设置
              </label>
              <div className="relative" ref={seoDropdownRef}>
                <button
                  type="button"
                  className="w-full rounded-sm border border-border-100 bg-card-50 px-4 py-3 text-foreground-50 cursor-pointer hover:border-border-200 hover:bg-background-300"
                  onClick={() => setIsSeoDropdownOpen(!isSeoDropdownOpen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Search className="h-4 w-4 text-foreground-300" />
                      <span className="text-sm">
                        {selectedSeoItem ? selectedSeoItem.title : "选择 SEO 设置"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-foreground-300 ${
                        isSeoDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isSeoDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-card-50 border border-border-100 rounded-sm shadow-lg max-h-80 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-border-100 bg-card-100 shrink-0">
                      <input
                        type="text"
                        placeholder="搜索 SEO 设置..."
                        value={seoSearchTerm}
                        onChange={(e) => setSeoSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background-50 border border-border-100 rounded-sm text-foreground-50 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                      {/* 创建新SEO选项 */}
                      <button
                        type="button"
                        className="w-full px-4 py-3 border-b border-border-100 cursor-pointer hover:bg-primary-50 text-left"
                        onClick={() => {
                          setIsCreateSeoModalOpen(true);
                          setIsSeoDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Plus className="h-4 w-4 text-primary-500" />
                          <span className="text-sm text-primary-600 font-medium">
                            创建新的 SEO 设置
                          </span>
                        </div>
                      </button>

                      {/* SEO列表 */}
                      {filteredSeoItems.length > 0 ? (
                        <>
                          {filteredSeoItems.map((item) => (
                            <button
                              type="button"
                              key={item.seo_id}
                              className="w-full px-4 py-3 cursor-pointer hover:bg-background-300 text-left"
                              onClick={() => handleSeoSelect(item.seo_id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-foreground-50">
                                    {item.title}
                                  </div>
                                  <div className="text-xs text-foreground-300 mt-1">
                                    {item.description}
                                  </div>
                                  <div className="text-xs text-foreground-400 mt-1">
                                    关键词: {item.keywords}
                                  </div>
                                </div>
                                {selectedSeoId === item.seo_id && (
                                  <Check className="h-4 w-4 text-primary-500" />
                                )}
                              </div>
                            </button>
                          ))}

                          {/* 获取更多按钮 - 样式与 SEO item 一致 */}
                          {hasMore && onLoadMore && (
                            <button
                              type="button"
                              className="w-full px-4 py-3 cursor-pointer hover:bg-background-300 border-t border-border-100 text-left"
                              onClick={onLoadMore}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-primary-600">
                                    {loading ? "加载中..." : "获取更多 SEO 设置"}
                                  </div>
                                  <div className="text-xs text-foreground-400 mt-1">
                                    点击加载更多选项
                                  </div>
                                </div>
                                <div className="h-4 w-4 text-primary-500">
                                  {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </div>
                              </div>
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="px-3 py-4 text-sm text-foreground-300 text-center">
                          没有找到匹配的 SEO 设置
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 标签选择器 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="tag-select"
                  className="block text-sm font-medium text-foreground-50"
                >
                  标签
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-foreground-400">{selectedTags.length}/3</span>
                  {selectedTags.length >= 3 && (
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-sm bg-warning-50 text-warning-600 text-xs font-medium">
                      <div className="w-1.5 h-1.5 bg-warning-500 rounded-full"></div>
                      <span>已达上限</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative" ref={tagDropdownRef}>
                <button
                  type="button"
                  className="w-full rounded-sm border border-border-100 bg-card-50 px-4 py-3 text-foreground-50 cursor-pointer hover:border-border-200 hover:bg-background-300"
                  onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Tag className="h-4 w-4 text-foreground-300" />
                      <span className="text-sm">选择标签</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-foreground-300 ${
                        isTagDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isTagDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-card-50 border border-border-100 rounded-sm shadow-lg max-h-80 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-border-100 bg-card-100 shrink-0">
                      <input
                        type="text"
                        placeholder="搜索标签..."
                        value={tagSearchTerm}
                        onChange={(e) => setTagSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-background-50 border border-border-100 rounded-sm text-foreground-50 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                      {/* 创建新标签选项 */}
                      <button
                        type="button"
                        className="w-full px-4 py-3 border-b border-border-100 cursor-pointer hover:bg-primary-50 text-left"
                        onClick={() => {
                          setIsCreateTagModalOpen(true);
                          setIsTagDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Plus className="h-4 w-4 text-primary-500" />
                          <span className="text-sm text-primary-600 font-medium">创建新标签</span>
                        </div>
                      </button>

                      {/* 标签列表 */}
                      {filteredTagItems.length > 0 ? (
                        <>
                          {filteredTagItems.map((item) => (
                            <button
                              type="button"
                              key={item?.tag_id}
                              className="w-full px-4 py-3 cursor-pointer hover:bg-background-300 text-left"
                              onClick={() => handleTagToggle(item?.tag_id)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-foreground-50">
                                  {item?.title || "未知标签"}
                                </span>
                                {selectedTags.includes(item?.tag_id) && (
                                  <Check className="h-4 w-4 text-primary-500" />
                                )}
                              </div>
                            </button>
                          ))}

                          {/* 获取更多按钮 */}
                          {hasMoreTag && (
                            <button
                              type="button"
                              className="w-full px-4 py-3 cursor-pointer hover:bg-background-300 border-t border-border-100 text-left"
                              onClick={handleLoadMoreTag}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-primary-600">
                                    {isTagLoading ? "加载中..." : "获取更多标签"}
                                  </div>
                                  <div className="text-xs text-foreground-400 mt-1">
                                    点击加载更多选项
                                  </div>
                                </div>
                                <div className="h-4 w-4 text-primary-500">
                                  {isTagLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </div>
                              </div>
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="px-3 py-4 text-sm text-foreground-300 text-center">
                          {isTagLoading ? "加载中..." : "暂无标签数据"}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 已选择的标签 */}
              {selectedTagItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTagItems.map((item) => (
                    <span
                      key={item?.tag_id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-sm"
                    >
                      {item?.title || "未知标签"}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(item?.tag_id)}
                        className="hover:text-primary-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 博客标题 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="blog-title"
                  className="block text-sm font-medium text-foreground-50"
                >
                  博客标题
                </label>
                <span
                  className={`text-xs font-medium ${
                    title.length > 50 ? "text-error-500" : "text-foreground-400"
                  }`}
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
                  title.length > 50
                    ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                    : "border-border-100"
                }`}
              />
              {title.length > 50 && (
                <p className="text-xs text-error-500 font-medium">标题不能超过50个字符</p>
              )}
            </div>

            {/* 博客描述 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="blog-description"
                  className="block text-sm font-medium text-foreground-50"
                >
                  博客描述
                </label>
                <span
                  className={`text-xs font-medium ${
                    description.length > 500 ? "text-error-500" : "text-foreground-400"
                  }`}
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
                  description.length > 500
                    ? "border-error-500 focus:border-error-500 focus:ring-error-500"
                    : "border-border-100"
                }`}
              />
              {description.length > 500 && (
                <p className="text-xs text-error-500 font-medium">描述不能超过500个字符</p>
              )}
            </div>

            {/* 封面图片选择器 */}
            <div className="space-y-3">
              <label htmlFor="cover-image" className="block text-sm font-medium text-foreground-50">
                封面图片
              </label>
              <div className="space-y-3">
                {selectedCoverImageUrl ? (
                  <div className="relative group">
                    <div className="relative w-full h-48">
                      <Image
                        src={selectedCoverImageUrl}
                        alt="Selected cover"
                        fill
                        className="object-cover rounded-sm border border-border-100"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-sm flex items-center justify-center transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsImageModalOpen(true)}
                      >
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
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
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
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end pt-4 border-t border-border-100">
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={
                  !selectedSeoId ||
                  !selectedCoverImageId ||
                  (type === "blog" && !selectedSectionId) ||
                  !title.trim() ||
                  !description.trim() ||
                  title.length > 50 ||
                  description.length > 500
                }
              >
                保存设置
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 模态框 */}
      <ImagePickerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={handleImageSelect}
      />

      {/* SEO创建模态框 */}
      <CreateSeoModal
        isOpen={isCreateSeoModalOpen}
        onClose={() => setIsCreateSeoModalOpen(false)}
        onSuccess={handleCreateSeoSuccess}
      />

      {/* 标签创建模态框 */}
      <CreateTagModal
        isOpen={isCreateTagModalOpen}
        onClose={() => setIsCreateTagModalOpen(false)}
        onSuccess={handleCreateTagSuccess}
      />
    </div>
  );
};
