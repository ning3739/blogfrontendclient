"use client";

import { CN, US } from "country-flag-icons/react/3x2";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import httpClient from "@/app/lib/http/client";

const LanguageSwitcher = () => {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const _router = useRouter();

  // 使用 useMemo 缓存 languageOptions，避免每次渲染都重新创建
  const languageOptions = useMemo(
    () => [
      {
        value: "zh",
        label: t("chinese"),
        flag: <CN className="w-4 h-4 rounded-sm" />,
      },
      {
        value: "en",
        label: t("english"),
        flag: <US className="w-4 h-4 rounded-sm" />,
      },
    ],
    [t],
  );

  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale === locale) return;

    try {
      // 设置 cookie
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      // 触发 httpClient 的语言变化事件
      httpClient.triggerLocaleChange(newLocale);
      // 使用完整页面刷新确保所有内容都更新为新语言
      window.location.reload();
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return (
    <div className="flex items-center bg-background-100/60 backdrop-blur-sm border border-border-50 rounded-sm p-0.5 gap-0.5">
      {languageOptions.map((option) => {
        const isActive = locale === option.value;

        return (
          <button
            type="button"
            key={option.value}
            onClick={() => handleLanguageChange(option.value)}
            title={option.label}
            className={`
              w-8 h-8 rounded-sm flex items-center justify-center transition-colors duration-200
              ${
                isActive
                  ? "bg-primary-100 text-primary-600"
                  : "text-foreground-300 hover:bg-background-200 hover:text-foreground-200"
              }
            `}
          >
            {option.flag}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
