"use client";

import React, { useState } from "react";
import { Sparkles, AudioLines } from "lucide-react";
import { motion } from "motion/react";
import useSWR from "swr";
import { useLocale, useTranslations } from "next-intl";
import BlogSummaryModel from "./BlogSummaryModel";
import BlogAudio from "./BlogAudio";

interface BlogActionProps {
  blogId: number;
}

interface BlogSummaryResponse {
  summary: string;
}

interface BlogAudioResponse {
  blog_id: number;
  tts: string | null;
}

// 音频波形组件
const AudioWaveIcon: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  if (!isPlaying) {
    return <AudioLines className="w-4 h-4" />;
  }

  return (
    <div className="flex items-center space-x-0.5 w-4 h-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.div
          key={index}
          className="w-0.5 bg-current rounded-full"
          animate={{
            height: [4, 12, 4, 8, 16, 4, 12, 4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const BlogAction: React.FC<BlogActionProps> = ({ blogId }) => {
  const locale = useLocale();
  const commonT = useTranslations("common");
  const blogT = useTranslations("blog");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playState, setPlayState] = useState<"stopped" | "playing" | "paused">(
    "stopped"
  );

  // 检查是否有总结内容
  const { data: summaryData, error: summaryError } =
    useSWR<BlogSummaryResponse>([`/blog/get-blog-summary/${blogId}`, locale], {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });

  // 检查是否有音频内容
  const { data: audioData, error: audioError } = useSWR<BlogAudioResponse>(
    [`/blog/get-blog-tts/${blogId}`, locale],
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 判断是否有总结和音频内容
  const hasSummary = !summaryError && summaryData?.summary;
  const hasAudio = !audioError && audioData?.tts;

  const handleAudioToggle = () => {
    if (playState === "stopped") {
      setPlayState("playing");
    } else if (playState === "playing") {
      setPlayState("paused");
    } else if (playState === "paused") {
      setPlayState("playing");
    }
  };

  const handlePlayStateChange = (playing: boolean) => {
    // 只有在音频自然结束或出错时才重置状态
    if (!playing && playState === "playing") {
      setPlayState("stopped");
    }
  };

  // 如果既没有总结也没有音频，不显示任何内容
  if (!hasSummary && !hasAudio) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
      {/* 总结卡片 - 只有在有总结内容时才显示 */}
      {hasSummary && (
        <div className="flex-1 group">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full p-4 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            aria-label={blogT("action.summarySubtitle")}
          >
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-white/20 rounded-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">
                  {commonT("summary")}
                </div>
                <div className="text-sm opacity-90">
                  {blogT("action.summarySubtitle")}
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 音频播放卡片 - 只有在有音频内容时才显示 */}
      {hasAudio && (
        <div className="flex-1 group">
          <button
            onClick={handleAudioToggle}
            className={`w-full p-4 rounded-sm shadow-sm transition-all duration-300 hover:-translate-y-1 active:translate-y-0 ${
              playState === "playing"
                ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md"
                : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300 hover:shadow-md"
            }`}
            aria-label={
              playState === "playing"
                ? blogT("action.audio.pause")
                : playState === "paused"
                ? blogT("action.audio.resume")
                : blogT("action.audio.play")
            }
          >
            <div className="flex items-center justify-center gap-3">
              <div
                className={`p-2 rounded-sm ${
                  playState === "playing" ? "bg-white/20" : "bg-slate-300"
                }`}
              >
                <AudioWaveIcon isPlaying={playState === "playing"} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">
                  {playState === "playing"
                    ? blogT("action.audio.pause")
                    : playState === "paused"
                    ? blogT("action.audio.resume")
                    : blogT("action.audio.play")}
                </div>
                <div className="text-sm opacity-90">
                  {playState === "playing"
                    ? blogT("action.audio.pauseDescription")
                    : playState === "paused"
                    ? blogT("action.audio.resumeDescription")
                    : blogT("action.audio.playDescription")}
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 隐藏的音频组件 */}
      {hasAudio && (
        <BlogAudio
          shouldPlay={playState === "playing"}
          onPlayStateChange={handlePlayStateChange}
          audioData={audioData}
        />
      )}

      {hasSummary && (
        <BlogSummaryModel
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          summaryData={summaryData}
        />
      )}
    </div>
  );
};

export default BlogAction;
