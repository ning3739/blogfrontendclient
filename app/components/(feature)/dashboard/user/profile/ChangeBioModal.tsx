import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/app/components/ui/button/Button";
import BaseModal from "@/app/components/ui/modal/BaseModal";
import userService from "@/app/lib/services/userService";

interface ChangeBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentBio?: string;
}

const ChangeBioModal: React.FC<ChangeBioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentBio = "",
}) => {
  const [bio, setBio] = useState(currentBio);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxLength = 500;
  const dashboardT = useTranslations("dashboard.myProfile");
  const commonT = useTranslations("common");

  useEffect(() => {
    if (isOpen) {
      setBio(currentBio);
    }
  }, [isOpen, currentBio]);

  const handleSubmit = async () => {
    if (bio.trim().length === 0) {
      alert("个人简介不能为空");
      return;
    }

    if (bio.length > maxLength) {
      alert(`个人简介不能超过 ${maxLength} 个字符`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await userService.updateMyBio({ bio: bio.trim() });
      if (response.status === 200) {
        toast.success("message" in response ? response.message : "Bio updated successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error("error" in response ? response.error : "Failed to update bio");
      }
    } catch (error) {
      console.error("更新个人简介失败:", error);
      toast.error("Failed to update bio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBio(currentBio);
    onClose();
  };

  const remainingChars = maxLength - bio.length;
  const isOverLimit = bio.length > maxLength;
  const isUnchanged = bio.trim() === currentBio.trim();

  const modalFooter = (
    <>
      <Button onClick={handleClose} variant="outline" disabled={isSubmitting}>
        {commonT("cancel")}
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={isSubmitting || isOverLimit || bio.trim().length === 0 || isUnchanged}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            <span>{commonT("submitting")}...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            <span>{commonT("submit")}</span>
          </>
        )}
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={dashboardT("editBio")}
      size="md"
      footer={modalFooter}
    >
      <div className="space-y-4">
        {/* Bio Input */}
        <div>
          <label
            htmlFor="bio-textarea"
            className="block text-sm font-medium text-foreground-50 mb-2"
          >
            {dashboardT("bio")}
          </label>
          <div className="relative">
            <textarea
              id="bio-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={dashboardT("bioPlaceholder")}
              rows={6}
              className={`w-full px-4 py-3 bg-background-100 border ${
                isOverLimit
                  ? "border-error-500 focus:ring-error-500"
                  : "border-border-100 focus:ring-primary-500"
              } rounded-sm text-foreground-100 placeholder-foreground-500 resize-none focus:outline-none focus:ring-2 transition-[border-color,box-shadow]`}
            />
          </div>

          {/* Character Count */}
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-foreground-300">
              {bio.trim().length === 0 ? dashboardT("bioRequired") : dashboardT("bioDescription")}
            </p>
            <span
              className={`text-xs font-medium ${
                isOverLimit
                  ? "text-error-500"
                  : remainingChars < 50
                    ? "text-warning-500"
                    : "text-foreground-400"
              }`}
            >
              {remainingChars} {dashboardT("bioRemaining")}
            </span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ChangeBioModal;
