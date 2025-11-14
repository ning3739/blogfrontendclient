"use client";

import { MediaTypeEnum } from "@/app/types/mediaServiceType";
import TiptapEditorModel from "@/app/components/(feature)/editor/TiptapEditorModel";

interface AudioPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaId: number, url: string) => void;
}

export default function AudioPickerModal({
  isOpen,
  onClose,
  onSelect,
}: AudioPickerModalProps) {
  return (
    <TiptapEditorModel
      type={MediaTypeEnum.audio}
      isOpen={isOpen}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}
