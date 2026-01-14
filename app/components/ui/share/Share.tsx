"use client";

import { Share2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button/butten";
import Modal from "@/app/components/ui/modal/Modal";

interface ShareProps {
  url: string;
  title: string;
  createdAtText: string;
}

const Share: React.FC<ShareProps> = ({ url, title, createdAtText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [qrPreviewDataUrl, setQrPreviewDataUrl] = useState<string>("");

  const safeTitle = useMemo(() => title?.trim() || "", [title]);

  const commonT = useTranslations("common");

  const drawRoundedRect = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
    ) => {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    },
    [],
  );

  const loadImage = useCallback(
    (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      }),
    [],
  );

  const _wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ) => {
    const words = text.split(/\s+/);
    let line = "";
    const lines: string[] = [];
    for (let i = 0; i < words.length; i++) {
      const testLine = line ? `${line} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    lines.forEach((ln, idx) => ctx.fillText(ln, x, y + idx * lineHeight));
    return y + (lines.length - 1) * lineHeight;
  };

  const getWrappedLines = useCallback(
    (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
      if (!text) return [];
      const hasSpace = /\s/.test(text);
      const tokens = hasSpace ? text.split(/\s+/) : Array.from(text);
      const space = hasSpace ? " " : "";
      const lines: string[] = [];
      let line = "";
      for (let i = 0; i < tokens.length; i++) {
        const next = line ? line + space + tokens[i] : tokens[i];
        if (ctx.measureText(next).width > maxWidth && line) {
          lines.push(line);
          line = tokens[i];
        } else {
          line = next;
        }
      }
      if (line) lines.push(line);
      return lines;
    },
    [],
  );

  const getThemeColor = useCallback((varName: string, fallback: string): string => {
    if (typeof window === "undefined") return fallback;
    const cssValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return cssValue || fallback;
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      const width = 540;
      const padding = 48;

      // Calculate content height first
      const innerW = width - padding * 2;
      const bannerW = innerW - 40;
      const bannerH = Math.round((bannerW * 9) / 16);
      const avatarSize = 80;
      const qrSize = 100;
      const gapAfterDate = 28;
      const gapAfterBanner = 28;
      const footerDivider = 2;
      const footerTextTopGap = 24;
      const bottomPadding = 16;

      // Content sections heights:
      // - Top padding: 20
      // - Avatar: avatarSize
      // - Gap: 12
      // - Date text: ~24
      // - Gap: gapAfterDate
      // - Banner: bannerH
      // - Gap: gapAfterBanner
      // - Footer divider
      // - Footer content: footerTextTopGap + qrSize
      // - Bottom padding
      const contentHeight =
        20 +
        avatarSize +
        12 +
        24 +
        gapAfterDate +
        bannerH +
        gapAfterBanner +
        footerDivider +
        footerTextTopGap +
        qrSize +
        bottomPadding;
      const height = contentHeight + padding * 2;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background
      ctx.fillStyle = getThemeColor("--color-background-100", "#f1f5f9");
      drawRoundedRect(ctx, 0, 0, width, height, 6);
      ctx.fill();

      // Inner panel
      const innerX = padding;
      const innerY = padding;
      const innerH = height - padding * 2;
      ctx.fillStyle = getThemeColor("--color-card-50", "#f8fafc");
      drawRoundedRect(ctx, innerX, innerY, innerW, innerH, 6);
      ctx.fill();
      // Inner panel border to match preview
      ctx.strokeStyle = getThemeColor("--color-border-100", "#e5e7eb");
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, innerX + 0.5, innerY + 0.5, innerW - 1, innerH - 1, 6);
      ctx.stroke();

      // Top gradient bar inside card (matches preview h-2 gradient)
      const topBarHeight = 8; // h-2
      ctx.save();
      drawRoundedRect(ctx, innerX, innerY, innerW, innerH, 6);
      ctx.clip();
      const grad = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY);
      grad.addColorStop(0, getThemeColor("--color-primary-500", "#3b82f6"));
      grad.addColorStop(0.5, getThemeColor("--color-primary-400", "#60a5fa"));
      grad.addColorStop(1, getThemeColor("--color-primary-600", "#2563eb"));
      ctx.fillStyle = grad;
      ctx.fillRect(innerX, innerY, innerW, topBarHeight);
      ctx.restore();

      // Top: avatar + date
      let currentY = innerY + 20;

      // Avatar background + image (image optional)
      ctx.save();
      drawRoundedRect(ctx, innerX + 20, currentY, avatarSize, avatarSize, 6);
      ctx.fillStyle = getThemeColor("--color-card-100", "#e2e8f0");
      ctx.fill();
      try {
        const avatar = await loadImage("/logo.png");
        ctx.clip();
        ctx.drawImage(avatar, innerX + 20, currentY, avatarSize, avatarSize);
      } catch (_) {
        // keep background if image fails
      }
      ctx.restore();

      currentY += avatarSize + 12;
      ctx.fillStyle = getThemeColor("--color-foreground-400", "#64748b");
      ctx.font = "500 20px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.textBaseline = "top";
      ctx.fillText(createdAtText, innerX + 20, currentY);

      // Banner area with themed color and title on top
      currentY += gapAfterDate; // gap after date
      const bannerX = innerX + 20;
      const bannerY = currentY;
      drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, 6);
      ctx.fillStyle = getThemeColor("--color-primary-500", "#3b82f6");
      ctx.fill();

      // Add subtle diagonal line pattern overlay on banner
      ctx.save();
      // Clip to banner rounded rect
      drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, 6);
      ctx.clip();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      const patternSpacing = 12;
      for (let x = -bannerH; x < bannerW; x += patternSpacing) {
        ctx.beginPath();
        ctx.moveTo(bannerX + x, bannerY);
        ctx.lineTo(bannerX + x + bannerH, bannerY + bannerH);
        ctx.stroke();
      }
      ctx.restore();

      // Title over banner (centered horizontally and vertically)
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 36px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const titleMaxWidth = bannerW - 48;
      const titleLines = getWrappedLines(ctx, safeTitle, titleMaxWidth);
      const totalTitleHeight = Math.max(titleLines.length, 1) * 44;
      const startTitleY = bannerY + Math.max(16, (bannerH - totalTitleHeight) / 2);
      titleLines.forEach((ln, idx) =>
        ctx.fillText(ln, bannerX + bannerW / 2, startTitleY + idx * 44),
      );
      ctx.textAlign = "start";

      // Footer divider - position based on content above
      currentY = bannerY + bannerH + gapAfterBanner; // gap after banner
      const footerTop = currentY;
      ctx.strokeStyle = getThemeColor("--color-border-50", "#e2e8f0");
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(innerX + 20, footerTop);
      ctx.lineTo(innerX + innerW - 20, footerTop);
      ctx.stroke();

      // Footer texts and QR code
      const fixedSiteName = "HeyXiaoli";
      const fixedAuthor = "小李生活志";
      const footerContentTop = footerTop + footerTextTopGap;

      // QR code on the right
      const qrDataUrl = await QRCode.toDataURL(url, { width: 240, margin: 1 });
      const qrImg = await loadImage(qrDataUrl);
      const qrX = innerX + innerW - 20 - qrSize;
      const qrY = footerContentTop;
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Footer texts (author above site name on the left), aligned with QR bottom
      ctx.textAlign = "start";
      const textBaseY = qrY + qrSize - 50;
      ctx.fillStyle = getThemeColor("--color-foreground-300", "#475569");
      ctx.font = "600 20px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(fixedAuthor, innerX + 20, textBaseY);
      ctx.fillStyle = getThemeColor("--color-foreground-400", "#334155");
      ctx.font = "700 28px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(fixedSiteName, innerX + 20, textBaseY + 30);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "share-card.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  }, [createdAtText, safeTitle, url, drawRoundedRect, getThemeColor, getWrappedLines, loadImage]);

  useEffect(() => {
    // Generate QR code only when modal is open
    if (!isOpen || !url) return;

    let mounted = true;
    QRCode.toDataURL(url, { width: 256, margin: 1 })
      .then((d: string) => {
        if (mounted) setQrPreviewDataUrl(d);
      })
      .catch((err: unknown) => console.error(err));

    return () => {
      mounted = false;
    };
  }, [url, isOpen]);

  return (
    <div className="flex justify-center">
      <Button
        variant="secondary"
        size="sm"
        className="inline-flex items-center gap-2 bg-primary-100 text-primary-600 hover:bg-primary-200 hover:text-primary-700"
        onClick={() => setIsOpen(true)}
      >
        <Share2 className="w-4 h-4" />
        {commonT("share.shareButton")}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={commonT("share.shareDescription")}
        size="sm"
        footer={
          <Button
            variant="primary"
            size="sm"
            className="inline-flex items-center gap-2"
            onClick={handleDownload}
          >
            {commonT("share.download")}
          </Button>
        }
      >
        <div className="flex flex-col items-center">
          <div className="w-[320px] rounded-sm overflow-hidden border border-border-100 shadow-md bg-card-50">
            <div className="h-2 bg-linear-to-r from-primary-500 via-primary-400 to-primary-600" />
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col">
                <div className="w-16 h-16 rounded-sm overflow-hidden bg-card-100">
                  <Image
                    src="/logo.png"
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <span className="mt-2 text-xs text-foreground-300">{createdAtText}</span>
              </div>

              <div className="relative w-full h-44 rounded-sm overflow-hidden border border-border-100 bg-linear-to-r from-primary-500 via-primary-400 to-primary-600">
                {/* Pattern overlay to match downloaded image banner */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 12px)",
                  }}
                />
                <div className="absolute inset-0 p-4 flex items-center justify-center text-center">
                  <h3 className="text-white text-[20px] leading-7 font-semibold text-center">
                    {title}
                  </h3>
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-border-100">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-foreground-300">小李生活志</div>
                    <div className="text-xl font-bold text-foreground-400">HeyXiaoli</div>
                  </div>
                  <div className="w-20 h-20 rounded-sm border border-border-100 bg-card-100 flex items-center justify-center">
                    {qrPreviewDataUrl ? (
                      // biome-ignore lint/performance/noImgElement: QR code preview generated from Canvas, not suitable for Next.js Image
                      <img src={qrPreviewDataUrl} alt="QR Code" className="w-[72px] h-[72px]" />
                    ) : (
                      <span className="text-[10px] text-foreground-300">生成中</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Share;
