import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "小李生活志 | Payments",
  description: "管理您的支付记录  | Manage your payment records",
  keywords: "Payments, 小李生活志, 支付记录",
};

export default function PaymentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
