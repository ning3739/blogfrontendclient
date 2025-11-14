"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Clock, Eye, Heart, MessageCircle, Bookmark } from "lucide-react";
import { useFormatter } from "next-intl";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";

interface Tag {
  id: number;
  title: string;
}

interface Stats {
  views: number;
  likes: number;
  comments: number;
  saves: number;
}

interface ContentCardProps {
  content: {
    id: number;
    title: string;
    description: string;
    cover_url: string;
    tags?: Tag[];
    stats?: Stats;
    created_at: string;
  };
  onClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, onClick }) => {
  const format = useFormatter();

  const hasValidStats =
    content.stats &&
    (content.stats.views > 0 ||
      content.stats.likes > 0 ||
      content.stats.comments > 0 ||
      content.stats.saves > 0);

  return (
    <motion.div
      className="rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group relative bg-card-100 border border-border-100 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        scale: 1.02,
        y: -4,
        boxShadow: "var(--shadow-lg)",
      }}
      onClick={onClick}
    >
      {content.cover_url && (
        <div className="aspect-video overflow-hidden relative">
          <Image
            src={content.cover_url}
            alt={content.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/20 to-transparent" />

          {/* 标签 - 右上角 */}
          {content.tags && content.tags.length > 0 && (
            <div className="absolute top-3 right-3 flex flex-wrap gap-1 max-w-[60%] justify-end">
              {content.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 text-xs font-medium rounded-sm bg-primary-100 text-primary-600 whitespace-nowrap"
                >
                  {tag.title}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* 标题 - 固定高度为2行 */}
        <h2 className="text-xl font-bold mb-3 line-clamp-2 h-[2rem] transition-colors duration-200 text-foreground-50">
          {content.title}
        </h2>

        {/* 描述 - 固定高度为3行 */}
        <p className="text-sm leading-relaxed line-clamp-3 h-[4rem] mb-4 text-foreground-300">
          {content.description}
        </p>

        {/* 底部装饰线 */}
        <div className="h-px transition-colors duration-200 bg-border-100" />

        {/* 底部信息：时间和统计 */}
        <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
          {/* 创建时间 */}
          <div className="flex items-center gap-1.5 text-xs text-foreground-300">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            <span>
              {handleDateFormat(content.created_at, format)}
            </span>
          </div>

          {/* 统计信息 */}
          {content.stats && (
            <div className="flex items-center gap-3 text-xs text-foreground-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{content.stats?.views}</span>
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{content.stats?.likes}</span>
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{content.stats?.comments}</span>
              </span>
              <span className="flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{content.stats?.saves}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
