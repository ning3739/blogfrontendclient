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
        router.push("/login");
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
  }, [router]);

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

      // 【主动刷新】如果只有 refresh_token，主动刷新 access_token
      // 说明：这是页面加载时的预防性刷新，避免首次 API 调用失败
      // 与 client.ts 中的自动刷新（被动刷新）互补，提升用户体验
      if (
        response.status === 200 &&
        "data" in response &&
        response.data.refresh_token === true &&
        response.data.access_token === false
      ) {
        try {
          // 调用刷新接口生成新的 access_token
          const refreshResponse = await authService.generateAccessToken();

          if (refreshResponse.status === 200) {
            // 刷新成功，设置为已认证
            setIsAuthenticated(true);
            return;
          }
        } catch (refreshError) {
          // 刷新失败，可能 refresh_token 也过期了
          console.warn("Token refresh failed:", refreshError);
          setIsAuthenticated(false);
          return;
        }
      }

      // 正常情况：检查 access_token 是否有效
      setIsAuthenticated(
        response.status === 200 && "data" in response && response.data.access_token === true,
      );
    } catch {
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
