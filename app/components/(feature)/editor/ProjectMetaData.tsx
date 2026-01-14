"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Plus,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import CreateSeoModal from "@/app/components/(feature)/editor/CreateSeoModal";
import DocumentPickerModal from "@/app/components/(feature)/editor/DocumentPickerModal";
import ImagePickerModal from "@/app/components/(feature)/editor/ImagePickerModal";
import { Button } from "@/app/components/ui/button/butten";
import Card from "@/app/components/ui/card/Card";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import type { GetSeoItemResponse } from "@/app/types/seoServiceType";

interface ProjectMetaDataProps {
  seoItems: GetSeoItemResponse[];
  loading: boolean;
  error: unknown;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSave?: (data: {
    selectedSeoId: number | null;
    selectedCoverImageId: number | null;
    selectedCoverImageUrl: string | null;
    selectedDocumentId: number | null;
    selectedDocumentUrl: string | null;
    projectType: number;
    price: number | null;
    title: string;
    description: string;
  }) => void;
  onSeoListRefresh?: () => void;
  initialData?: {
    selectedSeoId?: number | null;
    selectedCoverImageId?: number | null;
    selectedCoverImageUrl?: string | null;
    selectedDocumentId?: number | null;
    selectedDocumentUrl?: string | null;
    projectType?: string | number;
    price?: number | null;
    title?: string;
    description?: string;
  };
}

export const ProjectMetaData = ({
  seoItems,
  loading,
  error,
  hasMore,
  onLoadMore,
  onSave,
  onSeoListRefresh,
  initialData,
}: ProjectMetaDataProps) => {
  const [selectedSeoId, setSelectedSeoId] = useState<number | null>(null);
  const [selectedCoverImageId, setSelectedCoverImageId] = useState<number | null>(null);
  const [selectedCoverImageUrl, setSelectedCoverImageUrl] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
  const [projectType, setProjectType] = useState<number>(1);
  const [price, setPrice] = useState<number | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isSeoDropdownOpen, setIsSeoDropdownOpen] = useState(false);
  const [isCreateSeoModalOpen, setIsCreateSeoModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [seoSearchTerm, setSeoSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 只有当 initialData 有实际数据时才更新（检查 title 或 selectedSeoId 是否有值）
    if (initialData && (initialData.title || initialData.selectedSeoId)) {
      setSelectedSeoId(initialData.selectedSeoId ?? null);
      setSelectedCoverImageId(initialData.selectedCoverImageId ?? null);
      setSelectedCoverImageUrl(initialData.selectedCoverImageUrl ?? null);
      setSelectedDocumentId(initialData.selectedDocumentId ?? null);
      setSelectedDocumentUrl(initialData.selectedDocumentUrl ?? null);

      setProjectType(
        initialData.projectType
          ? typeof initialData.projectType === "string"
            ? parseInt(initialData.projectType, 10)
            : initialData.projectType
          : 1,
      );

      setPrice(initialData.price ?? null);
      setTitle(initialData.title ?? "");
      setDescription(initialData.description ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialData?.selectedSeoId,
    initialData?.selectedCoverImageId,
    initialData?.selectedCoverImageUrl,
    initialData?.selectedDocumentId,
    initialData?.selectedDocumentUrl,
    initialData?.projectType,
    initialData?.price,
    initialData?.title,
    initialData?.description,
    initialData,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSeoDropdownOpen(false);
        setSeoSearchTerm("");
      }
    };

    if (isSeoDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSeoDropdownOpen]);

  if (loading) {
    return (
      <LoadingSpinner message="正在加载项目元数据..." size="md" variant="wave" fullScreen={true} />
    );
  }

  if (error) {
    return <ErrorDisplay message="加载项目元数据失败" type="error" />;
  }

  if (!seoItems) {
    return <ErrorDisplay message="未找到项目元数据" type="notFound" />;
  }

  const filteredSeoItems = seoItems.filter(
    (item) =>
      item.title.toLowerCase().includes(seoSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(seoSearchTerm.toLowerCase()) ||
      item.keywords.toLowerCase().includes(seoSearchTerm.toLowerCase()),
  );

  const selectedSeoItem = seoItems.find((item) => item.seo_id === selectedSeoId);

  const handleSeoSelect = (seoId: number) => {
    setSelectedSeoId(seoId);
    setIsSeoDropdownOpen(false);
    setSeoSearchTerm("");
  };

  const handleImageSelect = (mediaId: number, url: string) => {
    setSelectedCoverImageId(mediaId);
    setSelectedCoverImageUrl(url);
    setIsImageModalOpen(false);
  };

  const handleDocumentSelect = (mediaId: number, url: string) => {
    setSelectedDocumentId(mediaId);
    setSelectedDocumentUrl(url);
    setIsDocumentModalOpen(false);
  };

  const handleCreateSeoSuccess = (seoId: number) => {
    // 刷新SEO列表
    if (onSeoListRefresh) {
      onSeoListRefresh();
    }
    // 自动选择新创建的SEO
    setSelectedSeoId(seoId);
    setIsSeoDropdownOpen(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        selectedSeoId,
        selectedCoverImageId,
        selectedCoverImageUrl,
        selectedDocumentId,
        selectedDocumentUrl,
        projectType,
        price,
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
            <h3 className="text-lg font-semibold text-foreground-50">项目设置</h3>
            {selectedSeoId &&
              selectedCoverImageId &&
              projectType &&
              title.trim() &&
              description.trim() &&
              title.length <= 50 &&
              description.length <= 500 &&
              !(price !== null && price > 0 && !selectedDocumentId) && (
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
            {/* SEO 选择器 */}
            <div className="space-y-3">
              <label
                htmlFor="project-seo-select"
                className="block text-sm font-medium text-foreground-50"
              >
                SEO 设置
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="w-full rounded-sm border border-border-100 bg-card-50 px-4 py-3 text-foreground-50 cursor-pointer hover:border-border-200 hover:bg-background-300 text-left"
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

            {/* 项目标题 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="project-title"
                  className="block text-sm font-medium text-foreground-50"
                >
                  项目标题
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
                id="project-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入项目标题"
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

            {/* 项目描述 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="project-description"
                  className="block text-sm font-medium text-foreground-50"
                >
                  项目描述
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
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入项目描述"
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

            {/* 项目类型选择器 */}
            <div className="space-y-3">
              <label
                htmlFor="project-type"
                className="block text-sm font-medium text-foreground-50"
              >
                项目类型
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 1, label: "Web应用" },
                  { value: 2, label: "移动应用" },
                  { value: 3, label: "桌面应用" },
                  { value: 4, label: "其他项目" },
                ].map((type) => (
                  <button
                    type="button"
                    key={type.value}
                    onClick={() => setProjectType(type.value)}
                    className={`p-3 rounded-sm border text-sm font-medium hover:border-primary-300 ${
                      projectType === type.value
                        ? "border-primary-500 bg-primary-50 text-primary-600 shadow-sm"
                        : "border-border-100 bg-card-50 text-foreground-50 hover:bg-primary-50"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 价格设置 */}
            <div className="space-y-3">
              <label
                htmlFor="project-price"
                className="block text-sm font-medium text-foreground-50"
              >
                项目价格
              </label>
              <div className="relative">
                <input
                  id="project-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price === null ? "" : price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setPrice(null);
                    } else {
                      const numValue = parseFloat(value);
                      setPrice(Number.isNaN(numValue) ? null : numValue);
                    }
                  }}
                  placeholder="请输入价格"
                  className="w-full px-4 py-3 pr-8 text-sm bg-card-50 border border-border-100 rounded-sm text-foreground-50 placeholder:text-foreground-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-foreground-400">
                  $
                </div>
              </div>
              <p className="text-xs text-foreground-400 flex items-center space-x-1">
                <span>💡</span>
                <span>价格是可选的，可以稍后设置。设置为 0 表示免费项目</span>
              </p>
            </div>

            {/* 封面图片选择器 */}
            <div className="space-y-3">
              <label
                htmlFor="project-cover"
                className="block text-sm font-medium text-foreground-50"
              >
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

            {/* 文档选择器 - 仅在价格大于0时显示 */}
            {price !== null && price > 0 && (
              <div className="space-y-3">
                <label
                  htmlFor="project-file"
                  className="block text-sm font-medium text-foreground-50"
                >
                  项目文件
                </label>
                <div className="space-y-3">
                  {selectedDocumentUrl ? (
                    <div className="flex items-center justify-between p-4 border border-border-100 rounded-sm bg-card-50 hover:bg-background-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-50 rounded-sm">
                          <FileText className="h-5 w-5 text-primary-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground-50">
                            {selectedDocumentUrl.split("/").pop()}
                          </p>
                          <p className="text-xs text-success-500 font-medium">✓ 已选择文档</p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsDocumentModalOpen(true)}
                      >
                        更换
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-4 border-2 border-dashed border-border-100 rounded-sm cursor-pointer hover:border-primary-500 hover:bg-primary-50 text-left"
                      onClick={() => setIsDocumentModalOpen(true)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-foreground-400" />
                        <p className="text-sm text-foreground-300 font-medium">点击选择项目文档</p>
                      </div>
                      <Button variant="outline" size="sm">
                        选择
                      </Button>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 保存按钮 */}
            <div className="flex justify-end pt-4 border-t border-border-100">
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={
                  !selectedSeoId ||
                  !selectedCoverImageId ||
                  !projectType ||
                  !title.trim() ||
                  !description.trim() ||
                  title.length > 50 ||
                  description.length > 500 ||
                  (price !== null && price > 0 && !selectedDocumentId)
                }
              >
                保存设置
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 图片选择模态框 */}
      <ImagePickerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={handleImageSelect}
      />

      {/* 创建SEO模态框 */}
      <CreateSeoModal
        isOpen={isCreateSeoModalOpen}
        onClose={() => setIsCreateSeoModalOpen(false)}
        onSuccess={handleCreateSeoSuccess}
      />

      {/* 文档选择模态框 */}
      <DocumentPickerModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        onSelect={handleDocumentSelect}
      />
    </div>
  );
};
