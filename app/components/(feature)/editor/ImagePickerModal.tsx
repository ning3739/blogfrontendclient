"use client";

import TiptapEditorModal from "@/app/components/(feature)/editor/TiptapEditorModal";
import { MediaTypeEnum } from "@/app/types/mediaServiceType";

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaId: number, url: string) => void;
}

export default function ImagePickerModal({ isOpen, onClose, onSelect }: ImagePickerModalProps) {
  return (
    <TiptapEditorModal
      type={MediaTypeEnum.image}
      isOpen={isOpen}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}
