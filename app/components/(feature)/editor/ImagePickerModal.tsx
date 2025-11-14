"use client";

import { MediaTypeEnum } from "@/app/types/mediaServiceType";
import TiptapEditorModel from "@/app/components/(feature)/editor/TiptapEditorModel";

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaId: number, url: string) => void;
}

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelect,
}: ImagePickerModalProps) {
  return (
    <TiptapEditorModel
      type={MediaTypeEnum.image}
      isOpen={isOpen}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}
