"use client";

import React from "react";
import useSWR from "swr";
import Image from "next/image";
import { useFormatter, useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock, DollarSign, FileText, Eye, ArrowLeft, Tag } from "lucide-react";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import { formatCurrency } from "@/app/lib/utils/handleCurrencyFormat";
import { Button } from "@/app/components/ui/button/butten";
import TextContent from "@/app/components/(feature)/content/TextContent";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";

export default function ContentDetailsPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get("projectSlug");
  const blogSlug = searchParams.get("blogSlug");
  const type = searchParams.get("type");
  const locale = useLocale();
  const format = useFormatter();

  let swrKey = "";

  if (type === "project") {
    swrKey = `/project/get-project-details/${projectSlug}?is_editor=false`;
  } else if (type === "blog") {
    swrKey = `/blog/get-blog-details/${blogSlug}?is_editor=false`;
  }

  const { data, isLoading, error } = useSWR([swrKey, locale]);

  const handleBack = () => {
    if (type === "project") {
      router.replace("/dashboard/projects");
    } else if (type === "blog") {
      router.replace("/dashboard/posts");
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        message="正在加载内容,请稍候..."
        size="md"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  if (error) {
    if (error.status === 404) {
      return (
        <ErrorDisplay
          title="未找到内容"
          message="请求的内容不存在"
          type="notFound"
          showReload={false}
        />
      );
    }
    return (
      <ErrorDisplay
        title="加载失败"
        message="无法加载内容,请稍后重试"
        type="error"
        showReload={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background-100">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Preview Header */}
        <div className="bg-background-50 rounded-sm border border-border-100 p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBack()}
            className="flex items-center gap-2 transition-colors duration-200 border-border-100 text-foreground-200 bg-background-200 hover:bg-background-300 hover:border-border-200"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div className="flex items-center gap-2 text-foreground-300">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">预览模式</span>
          </div>
        </div>

        {/* Project Cover */}
        <div className="bg-background-50 rounded-sm border border-border-100 overflow-hidden mb-4 sm:mb-6">
          <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96">
            {type === "project" ? (
              <Image
                src={data.cover_url}
                alt={data.project_name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 80vw"
              />
            ) : (
              <Image
                src={data.cover_url}
                alt={data.blog_name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 80vw"
              />
            )}
          </div>
        </div>

        {/* Project Header Info */}
        <div className="bg-background-50 rounded-sm border border-border-100 p-4 sm:p-6 mb-4 sm:mb-6">
          {type === "project" ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground-50 mb-3 leading-tight">
                {data.project_name}
              </h1>
              <p className="text-base sm:text-lg text-foreground-300 leading-relaxed mb-4 sm:mb-6">
                {data.project_description}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground-50 mb-3 leading-tight">
                {data.blog_name}
              </h1>
              <p className="text-base sm:text-lg text-foreground-300 leading-relaxed mb-4 sm:mb-6">
                {data.blog_description}
              </p>
            </>
          )}

          {/* Meta Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-border-100">
            {/* Price - Only for projects */}
            {type === "project" && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-background-100 rounded-sm flex-shrink-0">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-foreground-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground-400 truncate">价格</p>
                  <p className="text-sm sm:text-base font-semibold text-foreground-50 truncate">
                    {data.project_price > 0
                      ? formatCurrency(data.project_price, format, "NZD")
                      : "免费"}
                  </p>
                </div>
              </div>
            )}

            {/* Created At - Always shown */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-background-100 rounded-sm flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-foreground-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground-400 truncate">创建时间</p>
                <p className="text-sm sm:text-base font-semibold text-foreground-50 truncate">
                  {handleDateFormat(data.created_at, format)}
                </p>
              </div>
            </div>

            {/* Attachment/Content - Only for projects */}
            {type === "project" && (
              <div className="flex items-center gap-2 sm:gap-3 sm:col-span-2 lg:col-span-1">
                <div className="p-1.5 sm:p-2 bg-background-100 rounded-sm flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-foreground-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground-400 truncate">附件</p>
                  <p className="text-sm sm:text-base font-semibold text-foreground-50 truncate">
                    {data.attachment_id ? "可用" : "无"}
                  </p>
                </div>
              </div>
            )}

            {/* Tag - Only for blogs */}
            {type === "blog" && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-background-100 rounded-sm flex-shrink-0">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-foreground-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground-400 truncate">标签</p>
                  <p className="text-sm sm:text-base font-semibold text-foreground-50 truncate">
                    {data.blog_tags
                      .map((tag: { tag_title: string }) => tag.tag_title)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Content */}
        <div className="bg-background-50 rounded-sm border border-border-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground-50 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-border-100">
            内容
          </h2>
          <div className="overflow-hidden">
            {type === "project" ? (
              <TextContent content={data.project_content} />
            ) : (
              <TextContent content={data.blog_content} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
