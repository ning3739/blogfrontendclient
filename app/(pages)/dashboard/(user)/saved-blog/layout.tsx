import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "小李生活志 | Saved Blog",
  description: "小李生活志收藏的文章  | Heyxiaoli saved blog",
  keywords: "Saved Blog, 小李生活志, 收藏的文章",
};

export default function SavedBlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
