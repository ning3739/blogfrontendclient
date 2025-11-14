import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "小李生活志 | Profile",
  description:
    "查看和管理您的个人信息  | Check and manage your personal information",
  keywords: "Profile, 小李生活志, 个人资料",
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
