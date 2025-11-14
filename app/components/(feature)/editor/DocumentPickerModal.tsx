"use client";

import { MediaTypeEnum } from "@/app/types/mediaServiceType";
import TiptapEditorModel from "@/app/components/(feature)/editor/TiptapEditorModel";

interface DocumentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaId: number, url: string) => void;
}

export default function DocumentPickerModal({
  isOpen,
  onClose,
  onSelect,
}: DocumentPickerModalProps) {
  return (
    <TiptapEditorModel
      type={MediaTypeEnum.other}
      isOpen={isOpen}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}
