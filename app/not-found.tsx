"use client";

import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import DefaultBackground from "@/app/components/ui/background/DefaultBackground";
import { Button } from "@/app/components/ui/button/butten";

export default function NotFoundPage() {
  const router = useRouter();
  const t = useTranslations("notFoundPage");

  return (
    <div className="min-h-screen bg-linear-to-br from-background-50 via-background-50 to-background-100 w-full overflow-hidden relative">
      <DefaultBackground />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* 404 大标题 - 简洁现代 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative inline-block"
            >
              {/* 发光效果 */}
              <div className="absolute inset-0 bg-linear-to-r from-primary-500/20 via-primary-400/20 to-primary-500/20 blur-3xl" />

              <h1 className="relative text-[120px] sm:text-[180px] font-black text-transparent bg-clip-text bg-linear-to-br from-primary-400 via-primary-500 to-primary-600 leading-none select-none">
                404
              </h1>
            </motion.div>
          </motion.div>

          {/* 标题和描述 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <AlertCircle className="w-10 h-10 text-primary-500" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground-50">{t("title")}</h2>
            </div>

            <p className="text-foreground-300 text-lg sm:text-xl max-w-lg mx-auto">
              {t("description")}
            </p>
          </motion.div>

          {/* 按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/")}
              className="group min-w-40"
            >
              <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {t("backHome")}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.back()}
              className="group min-w-40"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              {t("goBack")}
            </Button>
          </motion.div>

          {/* 装饰性元素 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-foreground-400">{t("errorCode")}</p>
          </motion.div>
        </div>
      </div>

      {/* 背景装饰圆圈 */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl pointer-events-none"
      />
    </div>
  );
}
