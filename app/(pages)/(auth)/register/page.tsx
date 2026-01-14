"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/app/components/ui/button/butten";
import InputField from "@/app/components/ui/input/InputField";
import { useAuth } from "@/app/hooks/useAuth";
import { authService } from "@/app/lib/services/authService";
import { Validator } from "@/app/lib/utils/validator";

export default function RegisterPage() {
  const { silentAccountLogin } = useAuth();
  const authT = useTranslations("auth.register");
  const placeholderT = useTranslations("auth.placeholder");
  const validationT = useTranslations("auth.validation");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const validateForm = () => {
    const result = Validator.validateRegisterForm(username, email, code, password);

    return Validator.validateAndShowError(result, validationT, toast);
  };

  const handleSendCode = async () => {
    const usernameValidation = Validator.validateUsername(username);
    if (!Validator.validateAndShowError(usernameValidation, validationT, toast)) {
      return;
    }

    const emailValidation = Validator.validateEmail(email);
    if (!Validator.validateAndShowError(emailValidation, validationT, toast)) {
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await authService.sendVerificationCode({ email });
      if (response.status === 200) {
        toast.success("message" in response ? response.message : "Verification code sent");
        setCountdown(60);
      } else {
        toast.error("error" in response ? response.error : "Failed to send verification code");
      }
    } catch {
      toast.error("Failed to send verification code");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const response = await authService.createUserAccount({
      email,
      username,
      password,
      code,
    });

    if (response.status === 200) {
      toast.success("message" in response ? response.message : authT("registerSuccess"));
      await silentAccountLogin({ email, password });
    } else {
      toast.error("error" in response ? response.error : "Failed to create account");
    }

    setIsSubmitting(false);
  };
  return (
    <div className="w-full max-w-md mx-auto px-6 sm:px-0">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground-50 mb-3 tracking-tight">
          {authT("title")}
        </h1>
        <p className="text-foreground-100 text-lg">{authT("description")}</p>
      </div>
      {/* 注册表单 */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="username" className="block text-base font-semibold text-foreground-50">
            {authT("username")}
          </label>
          <InputField
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={placeholderT("username")}
            required
            autoComplete="username"
          />
        </div>
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
          <label htmlFor="code" className="block text-base font-semibold text-foreground-50">
            {authT("code")}
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <InputField
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={placeholderT("code")}
                required
                autoComplete="code"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleSendCode}
              disabled={!username || !email || isSendingCode || countdown > 0}
              loading={isSendingCode}
              className="whitespace-nowrap px-4 py-2 min-w-[120px]"
            >
              {countdown > 0 ? `${countdown}s` : authT("sendCode")}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-base font-semibold text-foreground-50">
            {authT("password")}
          </label>
          <InputField
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={placeholderT("password")}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            required
            autoComplete="password"
          />
        </div>

        {/* 注册按钮 */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          gradient={true}
          fullWidth={true}
          loading={isSubmitting}
          loadingText={authT("register")}
          className="mt-2"
        >
          {authT("register")}
        </Button>
      </form>

      {/* 注册链接 */}
      <div className="text-center mt-8">
        <p className="text-sm text-foreground-100">
          {authT("alreadyhaveaccount")}
          <Link
            href="/login"
            className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
          >
            {authT("signin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
