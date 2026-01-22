"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/app/components/ui/button/Button";
import BaseModal from "@/app/components/ui/modal/BaseModal";
import FriendService from "@/app/lib/services/friendService";
import { FriendType } from "@/app/types/friendServiceType";

interface UpdateFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  friendId: number;
  currentType: number;
}

function UpdateFriendModal({
  isOpen,
  onClose,
  onSuccess,
  friendId,
  currentType,
}: UpdateFriendModalProps) {
  const [selectedType, setSelectedType] = useState<number>(currentType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 重置选择当模态框关闭或打开时
  useEffect(() => {
    if (isOpen) {
      setSelectedType(currentType);
    } else {
      setSelectedType(currentType);
    }
  }, [isOpen, currentType]);

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
    if (selectedType === currentType) {
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await FriendService.updateFriendListType({
        friend_list_id: friendId,
        type: selectedType,
      });

      if (response.status === 200) {
        toast.success("message" in response ? response.message : "Friend type updated");
        onSuccess();
        onClose();
      } else {
        toast.error("error" in response ? response.error : "Failed to update friend type");
        onClose();
      }
    } catch (error) {
      // 处理未预期的错误
      console.error("更新友链类型失败:", error);
      toast.error("Failed to update friend type");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFriendTypeLabel = (type: number): string => {
    switch (type) {
      case FriendType.featured:
        return "推荐站点";
      case FriendType.normal:
        return "普通友链";
      case FriendType.hidden:
        return "隐藏";
      default:
        return "未知";
    }
  };

  const modalFooter = (
    <>
      <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
        取消
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={selectedType === currentType}
        loading={isSubmitting}
        loadingText="更新中..."
      >
        更新类型
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="更新友链类型"
      size="sm"
      footer={modalFooter}
    >
      <div>
        <label
          htmlFor="friend-type-select"
          className="block text-sm font-medium text-foreground-50 mb-2"
        >
          选择类型 <span className="text-error-500">*</span>
        </label>
        <select
          id="friend-type-select"
          value={selectedType}
          onChange={(e) => setSelectedType(parseInt(e.target.value, 10))}
          className="w-full rounded-sm border border-border-100 bg-background-50 px-4 py-3 text-foreground-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-[border-color,box-shadow] duration-200 hover:border-foreground-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          <option value={FriendType.featured}>推荐站点</option>
          <option value={FriendType.normal}>普通友链</option>
          <option value={FriendType.hidden}>隐藏</option>
        </select>
        <p className="mt-2 text-xs text-foreground-300">
          当前类型:{" "}
          <span className="font-medium text-foreground-50">{getFriendTypeLabel(currentType)}</span>
        </p>
      </div>
    </BaseModal>
  );
}

export default UpdateFriendModal;
