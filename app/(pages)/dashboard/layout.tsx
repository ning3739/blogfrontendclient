import type { Metadata } from "next";
import Dashboard from "@/app/components/layout/Dashboard";

export const metadata: Metadata = {
  title: "小李生活志 | Dashboard",
  description: "小李生活志后台管理系统  | Heyxiaoli dashboard",
  keywords: "Dashboard, 小李生活志, 后台管理系统",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Dashboard>{children}</Dashboard>;
}
