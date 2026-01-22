"use client";

import { Cookie, Database, Lock, Mail, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type React from "react";

const PrivacyPolicyPage: React.FC = () => {
  const t = useTranslations("privacyPolicy");

  const sections = [
    {
      icon: Database,
      title: t("dataCollection.title"),
      content: t("dataCollection.content"),
    },
    {
      icon: Lock,
      title: t("dataUsage.title"),
      content: t("dataUsage.content"),
    },
    {
      icon: Cookie,
      title: t("cookies.title"),
      content: t("cookies.content"),
    },
    {
      icon: UserCheck,
      title: t("userRights.title"),
      content: t("userRights.content"),
    },
    {
      icon: Mail,
      title: t("contact.title"),
      content: t("contact.content"),
    },
  ];

  return (
    <motion.div
      className="min-h-screen mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-3 py-12">
        {/* 页面标题区域 */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl mb-4 text-foreground-50 font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {t("title")}
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mx-auto leading-relaxed text-foreground-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {t("description")}
          </motion.p>

          {/* 分隔线 */}
          <motion.div
            className="max-w-2xl h-px bg-border-100 mx-auto mt-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
        </motion.div>

        {/* 内容区域 */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              className="rounded-sm p-8 border bg-card-100 border-border-100 hover:scale-[1.01] transition-transform duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.15 }}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-background-100 border border-border-100 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-foreground-200" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground-50 mb-3">{section.title}</h2>
                  <p className="text-foreground-300 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 底部说明 */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          <p className="text-sm text-foreground-400">{t("lastUpdated")}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicyPage;
