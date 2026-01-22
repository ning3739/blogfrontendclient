"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button/Button";
import BaseModal from "@/app/components/ui/modal/BaseModal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  error: string;
  itemTitle: string;
  itemType?: string;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  error,
  itemTitle,
  itemType = "文章",
}: DeleteConfirmModalProps) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => !isDeleting && onClose()}
      title={`确认删除${itemType}`}
      size="md"
      closeOnOverlayClick={!isDeleting}
      footer={
        <>
          <Button onClick={onClose} variant="outline" disabled={isDeleting}>
            取消
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-error-400 hover:bg-error-500 focus:ring-error-500"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                <span>删除中...</span>
              </>
            ) : (
              <span>确认删除</span>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-error-50 rounded-sm border border-error-100">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-error-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-error-500 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-error-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-error-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground-200 leading-relaxed">
              您确定要删除这{itemType === "项目" ? "个" : "篇"}
              {itemType}吗？删除后将无法恢复，所有相关数据都将被永久删除。
            </p>
          </div>
        </div>

        {/* Item Name */}
        {itemTitle && (
          <div className="p-3 bg-background-100 rounded-sm border border-border-100">
            <p className="text-sm font-medium text-foreground-100 break-words">{itemTitle}</p>
          </div>
        )}

        {/* Warning Message */}
        <div className="p-3 bg-warning-50 rounded-sm border border-warning-100">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-warning-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-warning-500 font-medium">
              此操作无法撤销，删除后数据将永久丢失！
            </p>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default DeleteConfirmModal;
