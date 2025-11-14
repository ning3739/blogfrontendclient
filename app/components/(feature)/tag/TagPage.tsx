"use client";

import useSWR from "swr";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import EmptyState from "@/app/components/ui/error/EmptyState";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import { Tag } from "lucide-react";
import * as echarts from "echarts";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import type { GetTagItemResponse } from "@/app/types/tagServiceType";
import type { OffsetPaginationResponse } from "@/app/types/commonType";

const TagPage = () => {
  const router = useRouter();
  const locale = useLocale();
  const commonT = useTranslations("common");
  const tagT = useTranslations("tag");
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: tagList,
    isLoading,
    error,
  } = useSWR([
    `/tag/get-tag-lists?page=${currentPage}&size=100&published_only=true`,
    locale,
  ]);

  // Normalize data to word cloud format (hook must be before any return)
  const words = useMemo(() => {
    const items: GetTagItemResponse[] = Array.isArray(tagList?.items)
      ? (tagList.items as GetTagItemResponse[])
      : Array.isArray(tagList)
      ? (tagList as GetTagItemResponse[])
      : [];
    // pick name field and provide weight by index
    const maxWeight = 100;
    const minWeight = 20;
    const n = items.length || 1;
    return items.map((it: GetTagItemResponse, idx: number) => {
      const name = it.title;
      const value = Math.round(
        maxWeight - ((maxWeight - minWeight) * idx) / Math.max(n - 1, 1)
      );
      // Store slug for navigation
      const slug = it.slug;
      return { name, value, slug };
    });
  }, [tagList]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    // Dynamically import echarts-wordcloud only on client side
    const initChart = async () => {
      if (typeof window === "undefined") return;

      await import("echarts-wordcloud");

      const el = containerRef.current;
      if (!el) return;
      if (!chartRef.current) {
        chartRef.current = echarts.init(el);
      }
      const getCss = (v: string, fb: string) => {
        const css = getComputedStyle(document.documentElement)
          .getPropertyValue(v)
          .trim();
        return css || fb;
      };
      const option: echarts.EChartsOption = {
        tooltip: {},
        series: [
          {
            type: "wordCloud",
            gridSize: 8,
            sizeRange: [14, 48],
            rotationRange: [-30, 30],
            shape: "circle",
            textStyle: {
              color: () =>
                [
                  getCss("--color-primary-500", "#3b82f6"),
                  getCss("--color-primary-400", "#60a5fa"),
                  getCss("--color-primary-600", "#2563eb"),
                  getCss("--color-foreground-400", "#334155"),
                ][Math.floor(Math.random() * 4)],
            },
            emphasis: {
              focus: "self",
              textStyle: {
                shadowBlur: 8,
                shadowColor: "rgba(0,0,0,0.2)",
              },
            },
            data: words,
          } as any,
        ],
      };

      // Set cursor to pointer for better UX
      if (el && typeof window !== "undefined") {
        el.style.cursor = "pointer";
      }
      chartRef.current.setOption(option);

      // Add click event listener for navigation
      chartRef.current.off("click");
      chartRef.current.on("click", (params: any) => {
        if (params.data?.slug) {
          router.push(`/tag/${params.data.slug}`);
        }
      });
    };

    initChart();

    const onResize = () => chartRef.current?.resize();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", onResize);
      }
      // Do not dispose to preserve instance if component persists; dispose on unmount
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [words, router]);

  if (isLoading) {
    return (
      <LoadingSpinner
        message={commonT("loading")}
        size="md"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  if (error && error.status !== 404) {
    return <ErrorDisplay message={commonT("loadFailedMessage")} type="error" />;
  }

  const pagination = tagList?.pagination as
    | OffsetPaginationResponse
    | undefined;

  return (
    <motion.div
      className="min-h-screen mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 标题区域，保持与 BlogPage 一致的节奏与配色 */}
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
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {tagT("title")}
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mx-auto leading-relaxed text-foreground-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {tagT("description", { default: "" })}
          </motion.p>

          {/* 分隔线 */}
          <motion.div
            className="max-w-2xl h-px bg-border-100 mx-auto mt-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
        </motion.div>

        {/* 词云区域 */}
        {words.length > 0 ? (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div
              ref={containerRef}
              className="w-full h-[420px] sm:h-[520px] rounded-sm border border-border-100 bg-background-50"
            />
          </motion.div>
        ) : (
          <EmptyState
            icon={Tag}
            title={commonT("notFound")}
            description={commonT("notFoundMessage")}
          />
        )}

        {/* 分页区域 */}
        {pagination && words.length > 0 && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <OffsetPagination
              pagination={pagination}
              onPageChange={(page: number) => setCurrentPage(page)}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TagPage;
