"use client";

import TiptapEditorModal from "@/app/components/(feature)/editor/TiptapEditorModal";
import { MediaTypeEnum } from "@/app/types/mediaServiceType";

interface AudioPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaId: number, url: string) => void;
}

export default function AudioPickerModal({ isOpen, onClose, onSelect }: AudioPickerModalProps) {
  return (
    <TiptapEditorModal
      type={MediaTypeEnum.audio}
      isOpen={isOpen}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}
