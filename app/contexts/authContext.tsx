"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { authService } from "@/app/lib/services/authService";
import type { AccountLoginRequest } from "@/app/types/authServiceType";

interface AuthContextType {
  accountLogin: (payload: AccountLoginRequest) => Promise<void>;
  silentAccountLogin: (payload: AccountLoginRequest) => Promise<void>;
  accountLogout: () => Promise<void>;
  githubLogin: () => void;
  googleLogin: () => void;
  checkAuthStatus: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  userLoading: boolean;
  error: string | null;
  user: any | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 只有在认证状态下才获取用户信息
  // 注意：useSWR的key可以是null，这不会违反hooks规则
  const { data: user, isValidating } = useSWR(isAuthenticated ? "/user/me/get-my-profile" : null, {
    revalidateOnMount: true,
  });

  // 计算userLoading状态：当已认证但用户数据还未加载时为true
  const userLoading = Boolean(isAuthenticated && (isValidating || !user));

  const accountLogin = useCallback(
    async (payload: AccountLoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.accountLogin(payload);
        if (response.status === 200 && "data" in response) {
          toast.success("message" in response ? response.message : "Login successful");
          setIsAuthenticated(response.data);
          router.push("/");
        } else {
          const errorMsg = "error" in response ? response.error : "Login failed";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error: any) {
        const errorMessage = error.error || "登录失败，请重试";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const silentAccountLogin = useCallback(
    async (payload: AccountLoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.silentAccountLogin(payload);
        if (response.status === 200 && "data" in response) {
          // 后端返回 data: true 表示登录成功
          setIsAuthenticated(response.data);
          router.push("/");
        }
      } catch (error: any) {
        const errorMessage = error.error || "自动登录失败，请手动登录";
        setError(errorMessage);
        // 静默登录失败时不显示toast，让用户手动登录
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const accountLogout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.accountLogout();
      if (response.status === 200 && "data" in response) {
        toast.success("message" in response ? response.message : "Logout successful");
        setIsAuthenticated(false);
        // 使用硬刷新跳转到登录页，避免 Next.js 路由缓存导致中间件检测到旧的认证状态
        window.location.href = "/login";
      } else {
        const errorMsg = "error" in response ? response.error : "Logout failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMessage = error.error || "登出失败，请重试";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const oauthLogin = useCallback((provider: "github" | "google") => {
    setLoading(true);
    setError(null);
    try {
      provider === "github" ? authService.githubLogin() : authService.googleLogin();
    } catch (error: any) {
      const errorMessage =
        error.error || `${provider === "github" ? "GitHub" : "Google"} 登录失败，请重试`;
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  }, []);

  const githubLogin = useCallback(() => oauthLogin("github"), [oauthLogin]);
  const googleLogin = useCallback(() => oauthLogin("google"), [oauthLogin]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await authService.checkAuthToken();

      if (response.status !== 200 || !("data" in response)) {
        setIsAuthenticated(false);
        return;
      }

      const { access_token, refresh_token } = response.data;

      // 【情况1】两个 token 都无效 - 用户未登录
      if (!access_token && !refresh_token) {
        setIsAuthenticated(false);
        return;
      }

      // 【情况2】有 AT 但无 RT - 异常状态，清除 cookie
      // 说明：RT 在数据库中被删除，AT 过期后无法刷新，必须重新登录
      if (access_token && !refresh_token) {
        try {
          await authService.accountLogout();
        } catch (logoutError) {
          // 静默失败
        }
        setIsAuthenticated(false);
        return;
      }

      // 【情况3】只有 RT 无 AT - 正常状态，等待 API 调用时自动刷新
      // 说明：AT 已过期，但 RT 还有效，Client.ts 会在首次 API 调用时自动刷新
      if (!access_token && refresh_token) {
        // 不主动刷新，让 Client.ts 的拦截器处理
        // 这样保持单一职责，token 刷新统一在 HTTP 层处理
        setIsAuthenticated(true); // RT 有效就认为已登录
        return;
      }

      // 【情况4】两个 token 都有效 - 正常状态
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  }, []);

  // 在组件挂载时检查认证状态
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextType = useMemo(
    () => ({
      accountLogin,
      silentAccountLogin,
      accountLogout,
      githubLogin,
      googleLogin,
      checkAuthStatus,
      isAuthenticated,
      loading,
      userLoading,
      error,
      user,
    }),
    [
      accountLogin,
      silentAccountLogin,
      accountLogout,
      githubLogin,
      googleLogin,
      checkAuthStatus,
      isAuthenticated,
      loading,
      userLoading,
      error,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
