"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button/butten";
import InputField from "@/app/components/ui/input/InputField";
import Modal from "@/app/components/ui/modal/Modal";
import tagService from "@/app/lib/services/tagService";

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tagId: number) => void;
  initialData?: {
    chinese_title: string;
  };
  tagId?: number; // For edit mode
}

const CreateTagModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  tagId,
}: CreateTagModalProps) => {
  const [formData, setFormData] = useState({
    chinese_title: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // 重置表单当模态框关闭时
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        chinese_title: "",
      });
    } else if (initialData) {
      // 编辑模式时设置初始数据
      setFormData({
        chinese_title: initialData.chinese_title,
      });
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
    if (!formData.chinese_title.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (tagId) {
        // 编辑模式
        response = await tagService.updateTag({
          tag_id: tagId,
          chinese_title: formData.chinese_title.trim(),
        });
      } else {
        // 创建模式
        response = await tagService.createTag({
          chinese_title: formData.chinese_title.trim(),
        });
      }

      // tagService 中的 handleToastResponse 已经处理了 toast 显示
      if ("data" in response && response.data) {
        // 调用成功回调
        if (onSuccess) {
          onSuccess(response.data.tag_id);
        }
        onClose();
      } else {
        // 失败时也关闭模态框，让用户看到toast错误信息
        // handleToastResponse 已经显示了错误toast
        onClose();
      }
    } catch (error) {
      // 处理未预期的错误
      console.error(tagId ? "更新标签失败:" : "创建标签失败:", error);
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

  const modalFooter = (
    <>
      <Button onClick={onClose} variant="outline" disabled={isLoading}>
        取消
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!formData.chinese_title.trim()}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            <span>{tagId ? "更新中..." : "创建中..."}</span>
          </>
        ) : (
          <>
            <span>{tagId ? "更新标签" : "创建标签"}</span>
          </>
        )}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tagId ? "编辑标签" : "创建新标签"}
      size="sm"
      footer={modalFooter}
    >
      <div>
        <label className="block text-sm font-medium text-foreground-50 mb-2">
          标签名称 <span className="text-error-500">*</span>
        </label>
        <InputField
          type="text"
          id="chinese_title"
          value={formData.chinese_title}
          onChange={(e) => handleInputChange("chinese_title", e.target.value)}
          placeholder="请输入标签名称"
          required
        />
      </div>
    </Modal>
  );
};

export default CreateTagModal;
