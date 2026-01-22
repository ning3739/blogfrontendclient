"use client";

import { CopyCheckIcon, CopyIcon, LinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type CopyrightProps = {
  className?: string;
  permalink?: string;
  licenseText?: string; // e.g., CC BY-NC 4.0
};

const Copyright = ({ className = "", permalink, licenseText = "CC BY-NC 4.0" }: CopyrightProps) => {
  const currentYear = new Date().getFullYear();
  const canonical = permalink || (typeof window !== "undefined" ? window.location.href : "");
  const [copied, setCopied] = useState(false);
  const copyrightT = useTranslations("dashboard.copyright");
  const contentT = useTranslations("content");

  const handleCopy = async () => {
    try {
      if (canonical) {
        await navigator.clipboard.writeText(canonical);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={
        "w-full rounded-sm border border-border-100 bg-background-50 p-4 sm:p-5 shadow-sm space-y-4 " +
        className
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-foreground-300">
          &copy; {currentYear} 小李生活志 · Heyxiaoli
        </span>
      </div>

      {canonical && (
        <div className="group flex items-center gap-2 w-full rounded-sm border border-border-100 bg-background-100/60 px-3 py-2 hover:border-primary-200 transition-colors">
          <LinkIcon className="w-3 h-3 shrink-0 text-foreground-300" />
          <a
            href={canonical}
            className="flex-1 min-w-0 truncate text-foreground-400 group-hover:text-primary-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            title={canonical}
          >
            {canonical}
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className={`ml-auto inline-flex items-center justify-center h-7 w-7 rounded-sm border focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors ${
              copied
                ? "bg-green-50 border-green-200 text-green-600"
                : "border-border-100 text-foreground-300 hover:text-primary-600 hover:border-primary-200"
            }`}
            aria-label="复制链接"
            title={copied ? contentT("copied") : contentT("copy")}
          >
            {copied ? <CopyCheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
          </button>
        </div>
      )}
      <div className="text-[11px] sm:text-xs text-foreground-300 leading-relaxed">
        {copyrightT("notice", { licenseText })}
      </div>
    </div>
  );
};

export default Copyright;
