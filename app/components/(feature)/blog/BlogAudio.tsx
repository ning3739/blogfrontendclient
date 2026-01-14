"use client";

import type React from "react";
import { useEffect, useRef } from "react";

interface BlogAudioResponse {
  blog_id: number;
  tts: string | null;
}

interface BlogAudioProps {
  shouldPlay: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
  audioData: BlogAudioResponse | undefined;
}

const BlogAudio = ({ shouldPlay, onPlayStateChange, audioData }: BlogAudioProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // 当shouldPlay为true时自动播放，为false时暂停
  useEffect(() => {
    if (audioData?.tts && audioRef.current) {
      if (shouldPlay) {
        audioRef.current.play().catch((error) => {
          console.error("[BlogAudio] Playback failed:", error);
          onPlayStateChange(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [shouldPlay, audioData?.tts, onPlayStateChange]);

  const handlePlay = () => {
    onPlayStateChange(true);
  };

  const handlePause = () => {
    onPlayStateChange(false);
  };

  const handleEnded = () => {
    onPlayStateChange(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("[BlogAudio] Audio playback error:", e);
    onPlayStateChange(false);
  };

  // 如果没有音频URL，不渲染任何内容
  if (!audioData?.tts) {
    return null;
  }

  return (
    <audio
      ref={audioRef}
      src={audioData.tts}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
      onError={handleError}
    />
  );
};

export default BlogAudio;
