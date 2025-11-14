"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { US, CN } from "country-flag-icons/react/3x2";
import httpClient from "@/app/lib/http/client";
import { useLocale } from "next-intl";

const LanguageSwitcher = () => {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const router = useRouter();

  const languageOptions = [
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
  ];

  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale === locale) return;

    try {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      httpClient.triggerLocaleChange(newLocale);
      router.refresh();
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
            key={option.value}
            onClick={() => handleLanguageChange(option.value)}
            title={option.label}
            className={`
              w-8 h-8 rounded-sm flex items-center justify-center transition-all duration-200
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
