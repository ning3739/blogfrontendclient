import React, { useState, useRef } from "react";
import { Upload, RotateCcw } from "lucide-react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import Modal from "@/app/components/ui/modal/Modal";
import { Button } from "@/app/components/ui/button/butten";
import userService from "@/app/lib/services/userService";
import { useTranslations } from "next-intl";

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ChangeAvatarModal: React.FC<ChangeAvatarModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashboardT = useTranslations("dashboard.myProfile");
  const commonT = useTranslations("common");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        alert(dashboardT("selectImage"));
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(dashboardT("imageTooLarge"));
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (
    croppedArea: CropArea,
    croppedAreaPixels: CropArea
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea
  ): Promise<File> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("无法创建 canvas context");
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], selectedFile?.name || "avatar.jpg", {
            type: blob.type,
          });
          resolve(file);
        }
      }, "image/jpeg");
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedFile = await getCroppedImg(preview, croppedAreaPixels);
      await userService.changeMyAvatar({ file: croppedFile });
      onSuccess?.();
      handleReset();
    } catch (error) {
      console.error("上传头像失败:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview("");
    setShowCropper(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const modalFooter = !showCropper ? (
    <Button onClick={handleClose} variant="outline" disabled={isUploading}>
      {commonT("cancel")}
    </Button>
  ) : (
    <>
      <Button
        variant="outline"
        disabled={isUploading}
        onClick={() => {
          setShowCropper(false);
          setSelectedFile(null);
          setPreview("");
          setCroppedAreaPixels(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        {dashboardT("reselect")}
      </Button>
      <Button
        variant="primary"
        onClick={handleUpload}
        disabled={isUploading || !croppedAreaPixels}
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            <span>{commonT("uploading")}...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            <span>{dashboardT("uploadAvatar")}</span>
          </>
        )}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={dashboardT("changeAvatar")}
      size="lg"
      footer={showCropper ? modalFooter : undefined}
    >
      <div className="space-y-6">
        {!showCropper ? (
          <>
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors ${"border-border-200 hover:border-border-300"}`}
            >
              <Upload className="w-12 h-12 text-foreground-300 mx-auto mb-4" />
              <p className="text-foreground-200 mb-2">
                {selectedFile
                  ? dashboardT("selectedFile", { name: selectedFile.name })
                  : dashboardT("dragImageHere")}
              </p>
              <p className="text-sm text-foreground-300 mb-4">
                {dashboardT("supportedFormats")}
              </p>
              <label className="inline-block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                >
                  {dashboardT("selectFile")}
                </Button>
              </label>
            </div>

            {/* Preview Section */}
            {preview && (
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-background-50 border border-border-100">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Cropper Section */}
            <div className="relative w-full h-64 bg-background-50 rounded-sm overflow-hidden border border-border-100">
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
            </div>

            {/* Zoom Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground-200">
                  {dashboardT("zoom")}
                </label>
                <span className="text-xs text-foreground-300">
                  {zoom.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-border-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:bg-primary-600 [&::-webkit-slider-thumb]:transition-colors [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:bg-primary-600 [&::-moz-range-thumb]:transition-colors"
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ChangeAvatarModal;
