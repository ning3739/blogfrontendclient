"use client";

import TiptapEditorModal from "@/app/components/(feature)/editor/TiptapEditorModal";
import { MediaTypeEnum } from "@/app/types/mediaServiceType";

interface VideoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaId: number, url: string) => void;
}

export default function VideoPickerModal({ isOpen, onClose, onSelect }: VideoPickerModalProps) {
  return (
    <TiptapEditorModal
      type={MediaTypeEnum.video}
      isOpen={isOpen}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}
