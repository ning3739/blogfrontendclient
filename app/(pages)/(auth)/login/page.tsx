"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/app/components/ui/button/butten";
import GithubIcon from "@/app/components/ui/icon/GithubIcon";
import GoogleIcon from "@/app/components/ui/icon/GoogleIcon";
import InputField from "@/app/components/ui/input/InputField";
import { useAuth } from "@/app/hooks/useAuth";
import { Validator } from "@/app/lib/utils/validator";

export default function LoginPage() {
  const authT = useTranslations("auth.login");
  const placeholderT = useTranslations("auth.placeholder");
  const validationT = useTranslations("auth.validation");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { accountLogin, googleLogin, githubLogin, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 防止重复提交
    if (loading || isSubmitting) {
      return;
    }

    // 使用 Validator 进行表单验证
    const validationResult = Validator.validateLoginForm(email, password, 8);

    if (!Validator.validateAndShowError(validationResult, validationT, toast)) {
      return;
    }

    // 设置提交状态
    setIsSubmitting(true);

    try {
      // 执行登录
      await accountLogin({
        email: Validator.cleanEmail(email),
        password,
      });
    } finally {
      // 无论成功或失败都清除提交状态
      setIsSubmitting(false);
    }
  };

  // Google 登录处理函数
  const handleGoogleLogin = () => {
    if (loading) return;

    // 直接调用重定向函数，不需要异步处理
    googleLogin();
  };

  // GitHub 登录处理函数
  const handleGithubLogin = () => {
    if (loading) return;

    // 直接调用重定向函数，不需要异步处理
    githubLogin();
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 sm:px-0">
      {/* 头部标题 */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground-50 mb-3 tracking-tight">
          {authT("title")}
        </h1>
        <p className="text-foreground-100 text-lg">{authT("description")}</p>
      </div>

      {/* 登录表单 */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-base font-semibold text-foreground-50">
            {authT("email")}
          </label>
          <InputField
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholderT("email")}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-base font-semibold text-foreground-50">
              {authT("password")}
            </label>
            <Link
              href="/reset-password"
              className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              {authT("forgotPassword")}
            </Link>
          </div>
          <InputField
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={placeholderT("password")}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            required
            autoComplete="current-password"
          />
        </div>

        {/* 登录按钮 */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          gradient={true}
          fullWidth={true}
          loading={loading || isSubmitting}
          loadingText={authT("login")}
          className="mt-2"
        >
          {authT("login")}
        </Button>
      </form>

      {/* 分割线 */}
      <div className="mt-8 mb-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-foreground-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background-300 text-foreground-50 font-medium">
              {authT("orContinueWith")}
            </span>
          </div>
        </div>
      </div>

      {/* 社交登录按钮 */}
      <div className="space-y-3 mb-8">
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth={true}
          onClick={handleGoogleLogin}
          disabled={loading}
          className="bg-background-300 border-foreground-200 text-foreground-100 hover:bg-background-200 hover:border-foreground-300 text-sm font-medium"
        >
          <GoogleIcon className="w-5 h-5 mr-2 shrink-0" />
          <span>{authT("loginwithgoogle")}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth={true}
          onClick={handleGithubLogin}
          disabled={loading}
          className="bg-background-300 border-foreground-200 text-foreground-100 hover:bg-background-200 hover:border-foreground-300 text-sm font-medium"
        >
          <GithubIcon className="w-5 h-5 mr-2 shrink-0 " />
          <span>{authT("loginwithgithub")}</span>
        </Button>
      </div>

      {/* 注册链接 */}
      <div className="text-center">
        <p className="text-sm text-foreground-100">
          {authT("donthaveaccount")}
          <Link
            href="/register"
            className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
          >
            {authT("signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
