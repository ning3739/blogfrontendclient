"use client";

import React from "react";
import Head from "next/head";
import type { Metadata } from "next";
import { usePathname } from "next/navigation";
import AuthBackground from "@/app/components/ui/background/AuthBackground";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  const metadata: Metadata = {
    title: isLoginPage
      ? "登录 | Login"
      : isRegisterPage
      ? "注册 | Register"
      : "重置密码 | Reset Password",
    description: isLoginPage
      ? "请登录您的账户继续使用"
      : isRegisterPage
      ? "请注册您的账户继续使用"
      : "请重置您的密码继续使用",
    keywords: isLoginPage
      ? "登录, 注册, 重置密码"
      : isRegisterPage
      ? "登录, 注册, 重置密码"
      : "登录, 注册, 重置密码",
  };
  return (
    <>
      <Head>
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description as string} />
        <meta name="keywords" content={metadata.keywords as string} />
      </Head>
      <AuthBackground>{children}</AuthBackground>
    </>
  );
}
