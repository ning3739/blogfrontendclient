"use client";

import { FileText, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";
import { SiBilibili, SiGithub, SiSinaweibo, SiWechat } from "react-icons/si";
import useSWR from "swr";
import ContentCard from "@/app/components/ui/card/ContentCard";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import type { GetRecentPopulorBlogResponse } from "@/app/types/blogServiceType";

const HomeDetails = () => {
  const [emojiIndex, setEmojiIndex] = React.useState(0);
  const [isHovering, setIsHovering] = React.useState(false);
  const [isWaving, setIsWaving] = React.useState(false);
  const emojis = ["🎯", "✨", "🔥", "💎", "⚡", "🌟", "💪", "🚀"];
  const router = useRouter();
  const commonT = useTranslations("common");
  const homeT = useTranslations("home");

  // 社交链接配置
  const socialLinks = [
    {
      href: "https://weixin.qq.com",
      label: "WeChat",
      icon: SiWechat,
    },
    {
      href: "https://weibo.com/u/7513354480",
      label: "Weibo",
      icon: SiSinaweibo,
    },
    {
      href: "https://space.bilibili.com/72991438",
      label: "Bilibili",
      icon: SiBilibili,
    },
    {
      href: "https://github.com/NING3739",
      label: "Github",
      icon: SiGithub,
    },
  ];

  // 获取热门博客数据
  const {
    data: blogLists,
    isLoading,
    error,
  } = useSWR<GetRecentPopulorBlogResponse>("/blog/get-recent-popular-blog");

  if (isLoading) {
    return (
      <LoadingSpinner variant="wave" size="lg" message={commonT("loading")} fullScreen={true} />
    );
  }

  if (error && error.status !== 404) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
      />
    );
  }

  const handleEmojiClick = () => {
    setEmojiIndex((prev) => (prev + 1) % emojis.length);
  };

  const handleWaveClick = () => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-12">
      {/* 头像 */}
      <div className="mb-6 sm:mb-8 md:mb-10 relative flex justify-center sm:justify-start">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
          {/* 背景装饰圆圈 */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-12 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1.5, 1, 1.5],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute -inset-10 bg-primary-400/20 rounded-full blur-2xl pointer-events-none"
          />

          {/* 头像图片 */}
          <motion.div
            className="relative z-10 w-full h-full"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Image
              src="/logo.png"
              alt="Avatar"
              width={192}
              height={192}
              className="w-full h-full object-cover rounded-full"
              priority
            />
          </motion.div>
        </div>
      </div>

      {/* 大标题角色标签 */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 sm:gap-x-4 gap-y-2 sm:gap-y-3 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
          <motion.span
            className="text-foreground-50 font-mono"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {homeT("roles.developer")},
          </motion.span>
          <span className="relative inline-block font-mono px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 border-2 border-solid hover:border-dashed border-primary-400 transition-all duration-300">
            {homeT("roles.designer")}
            {/* 四个角的小方块手柄 */}
            <span className="absolute -top-1 -left-1 w-2 h-2 bg-background-50 border border-primary-400"></span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-background-50 border border-primary-400"></span>
            <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-background-50 border border-primary-400"></span>
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-background-50 border border-primary-400"></span>
          </span>
          <span className="text-foreground-50">,</span>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 sm:gap-x-4 gap-y-2 sm:gap-y-3 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mt-2 sm:mt-3">
          <span className="inline-flex items-center gap-2 sm:gap-3 text-foreground-50">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12" />
            {homeT("roles.detailOriented")}
          </span>
          <span className="text-foreground-50">,</span>
          <span
            className="inline-flex items-center gap-2 sm:gap-3 text-foreground-50 cursor-pointer select-none"
            onClick={handleEmojiClick}
          >
            <motion.span
              key={emojiIndex}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="text-3xl sm:text-4xl md:text-6xl"
            >
              {emojis[emojiIndex]}
            </motion.span>
            {homeT("roles.perfectionist")}
          </span>
        </div>
      </div>

      {/* 介绍文字 */}
      <div
        className="mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base leading-snug max-w-3xl text-center sm:text-left relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* 背景装饰 */}
        <motion.div
          className="absolute -inset-3 bg-linear-to-r from-primary-500/5 via-primary-400/10 to-primary-500/5 rounded-2xl blur-xl"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: isHovering ? 1 : 0.6 }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative z-10 space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-foreground-200"
          >
            <motion.span
              className="inline-block text-2xl sm:text-3xl mr-2 cursor-pointer select-none"
              onClick={handleWaveClick}
              animate={
                isWaving
                  ? {
                      rotate: [0, 14, -8, 14, -4, 10, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.6, ease: "easeInOut" }}
              whileHover={{ scale: 1.1 }}
            >
              👋
            </motion.span>
            <span className="font-medium text-foreground-50">
              {homeT("intro.hi")}
              <span className="relative inline-block mx-1 text-primary-400 font-semibold">
                {homeT("intro.name")}
              </span>
              ！
            </span>
            {homeT("intro.site")}
            <br />
            <motion.span
              className="inline-block mx-1 px-2 py-0.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {homeT("intro.tech")}
            </motion.span>
            、
            <motion.span
              className="inline-block mx-1 px-2 py-0.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {homeT("intro.design")}
            </motion.span>
            {homeT("common.and")}
            <motion.span
              className="inline-block mx-1 mt-2 px-2 py-0.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {homeT("intro.life")}
            </motion.span>
            {homeT("common.dot")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-foreground-200"
          >
            {homeT("second.iLovePrefix")}
            <span className="inline-block mx-1 text-primary-400 font-semibold">
              {homeT("second.coding")}
            </span>
            {homeT("common.and")}
            <span className="inline-block mx-1 text-primary-400 font-semibold">
              {homeT("second.design")}
            </span>
            {homeT("second.believePrefix")}
            <span className="relative inline-block mx-1">
              <span className="text-primary-400 font-semibold">{homeT("second.details")}</span>
              <motion.span
                className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isHovering ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </span>
            {homeT("common.dot")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-foreground-200"
          >
            <p>
              {homeT("welcome.prefix")}
              <motion.span
                className="inline-block mx-1 text-primary-400 font-medium hover:text-primary-300 hover:scale-110 transition-all"
                whileHover={{ scale: 1.1 }}
              >
                {homeT("welcome.inspire")}
              </motion.span>
              {homeT("common.and")}
              <motion.span
                className="inline-block mx-1 text-primary-400 font-medium hover:text-primary-300 hover:scale-110 transition-all"
                whileHover={{ scale: 1.1 }}
              >
                {homeT("welcome.resonate")}
              </motion.span>
              {homeT("common.dot")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* 社交图标 */}
      <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-10">
        {socialLinks.map((social) => {
          const Icon = social.icon;
          return (
            <Link
              key={social.label}
              href={social.href}
              className="flex items-center justify-center hover:scale-110 transition-transform text-foreground-300 hover:text-primary-400"
              aria-label={social.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>

      {/* 分隔线 */}
      <motion.div
        className="w-full h-px bg-border-100 mx-auto my-8 sm:my-12 md:my-16"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      />

      {/* 热门博客列表 */}
      <div className="space-y-6 sm:space-y-8">
        {/* 标题区域 - 与整体设计语言保持一致 */}
        <motion.div
          className="text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground-50 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            {homeT("popularPosts")}
          </motion.h2>
        </motion.div>

        {!blogLists || blogLists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.5 }}
          >
            <EmptyState
              icon={FileText}
              title={commonT("notFound")}
              description={commonT("notFoundMessage")}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {blogLists.map((blog, index) => (
              <motion.div
                key={blog.blog_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 1.5 + index * 0.1,
                  ease: "easeOut",
                }}
              >
                <ContentCard
                  content={{
                    id: blog.blog_id,
                    title: blog.blog_title,
                    description: blog.blog_description,
                    cover_url: blog.cover_url,
                    tags: blog.blog_tags?.map((tag) => ({
                      id: tag.tag_id,
                      title: tag.tag_title,
                    })),
                    stats: blog.blog_stats,
                    created_at: blog.created_at,
                  }}
                  onClick={() => {
                    router.push(`/${blog.section_slug}/${blog.blog_slug}`);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeDetails;
