"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/app/components/ui/button/butten";
import InputField from "@/app/components/ui/input/InputField";
import Modal from "@/app/components/ui/modal/Modal";
import seoService from "@/app/lib/services/seoService";
import type { CreateSeoRequest } from "@/app/types/seoServiceType";

interface CreateSeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (seoId: number) => void;
  initialData?: {
    chinese_title: string;
    chinese_description: string;
    chinese_keywords: string;
  };
  seoId?: number;
}

export const CreateSeoModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  seoId,
}: CreateSeoModalProps) => {
  const [formData, setFormData] = useState({
    chinese_title: "",
    chinese_description: "",
    chinese_keywords: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // 重置表单当模态框关闭时，或初始化编辑数据
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        chinese_title: "",
        chinese_description: "",
        chinese_keywords: "",
      });
    } else if (initialData) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  // ESC键关闭模态框
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!formData.chinese_title || !formData.chinese_description || !formData.chinese_keywords) {
      return;
    }

    setIsLoading(true);

    try {
      let response: Awaited<ReturnType<typeof seoService.createSeo>>;
      if (seoId) {
        // 编辑模式
        response = await seoService.updateSeo({
          seo_id: seoId,
          chinese_title: formData.chinese_title,
          chinese_description: formData.chinese_description,
          chinese_keywords: formData.chinese_keywords,
        });
      } else {
        // 创建模式
        response = await seoService.createSeo(formData as CreateSeoRequest);
      }

      if (response.status === 200 && "data" in response && response.data) {
        toast.success(
          "message" in response ? response.message : seoId ? "SEO updated" : "SEO created",
        );
        // 调用成功回调
        if (onSuccess) {
          onSuccess(response.data.seo_id || seoId);
        }
        onClose();
      } else {
        toast.error("error" in response ? response.error : "Failed to save SEO");
        onClose();
      }
    } catch (error) {
      // 处理未预期的错误
      console.error("SEO操作失败:", error);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={seoId ? "编辑 SEO 设置" : "创建新的 SEO 设置"}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
            取消
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={
              !formData.chinese_title || !formData.chinese_description || !formData.chinese_keywords
            }
          >
            {seoId ? "更新 SEO 设置" : "创建 SEO 设置"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="chinese_title"
            className="block text-sm font-medium text-foreground-50 mb-2"
          >
            标题 <span className="text-error-500">*</span>
          </label>
          <InputField
            type="text"
            id="chinese_title"
            value={formData.chinese_title}
            onChange={(e) => handleInputChange("chinese_title", e.target.value)}
            placeholder="请输入SEO标题"
            required
          />
        </div>

        <div>
          <label
            htmlFor="chinese_description"
            className="block text-sm font-medium text-foreground-50 mb-2"
          >
            描述 <span className="text-error-500">*</span>
          </label>
          <InputField
            type="textarea"
            id="chinese_description"
            value={formData.chinese_description}
            onChange={(e) => handleInputChange("chinese_description", e.target.value)}
            placeholder="请输入SEO描述"
            required
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="chinese_keywords"
            className="block text-sm font-medium text-foreground-50 mb-2"
          >
            关键词 <span className="text-error-500">*</span>
          </label>
          <InputField
            type="text"
            id="chinese_keywords"
            value={formData.chinese_keywords}
            onChange={(e) => handleInputChange("chinese_keywords", e.target.value)}
            placeholder="输入关键词，用逗号分隔"
            required
          />
          <p className="text-xs text-foreground-400 mt-2 flex items-center space-x-1">
            <span>💡</span>
            <span>多个关键词请用逗号（,）分隔</span>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CreateSeoModal;
