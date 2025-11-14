"use client";

import { MediaTypeEnum } from "@/app/types/mediaServiceType";
import TiptapEditorModel from "@/app/components/(feature)/editor/TiptapEditorModel";

interface VideoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaId: number, url: string) => void;
}

export default function VideoPickerModal({
  isOpen,
  onClose,
  onSelect,
}: VideoPickerModalProps) {
  return (
    <TiptapEditorModel
      type={MediaTypeEnum.video}
      isOpen={isOpen}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}
