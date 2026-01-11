import type { Metadata } from "next";
import { Crimson_Pro, JetBrains_Mono, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/authContext";
import SWRProvider from "./providers/SWRProvider";
import "./globals.css";

// 英文字体：Crimson Pro - 优雅的衬线字体，粗细适中，温暖人文
const crimsonPro = Crimson_Pro({
  variable: "--font-crimson-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// 代码字体：JetBrains Mono - 专为开发者设计的等宽字体
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// 中文字体：Noto Sans SC - 无衬线字体，支持完整中文字符
const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

// 中文字体：Noto Serif SC - 衬线字体，支持完整中文字符
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// 中文字体配置完成

export const metadata: Metadata = {
  title: "小李生活志 | Heyxiaoli",
  description:
    "小李生活志 - 记录生活点滴，分享技术与随笔。 | Heyxiaoli - Documenting life moments, sharing tech and essays.",
  keywords: [
    "小李生活志",
    "生活记录",
    "博客",
    "技术分享",
    "随笔",
    "日常",
    "生活点滴",
    "Heyxiaoli",
    "life journal",
    "blog",
    "tech sharing",
    "essays",
    "daily life",
    "moments",
    "personal",
  ],
  authors: [{ name: "小李 | Heyxiaoli", url: "https://heyxiaoli.com" }],
  creator: "小李 | Heyxiaoli",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${crimsonPro.variable} ${jetBrainsMono.variable} ${notoSansSC.variable} ${notoSerifSC.variable} antialiased`}
        data-locale={locale}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <SWRProvider>
              <Toaster position="top-center" reverseOrder={false} />
              <AuthProvider>{children}</AuthProvider>
            </SWRProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
