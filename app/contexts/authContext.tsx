"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import type { AccountLoginRequest } from "@/app/types/authServiceType";
import { authService } from "@/app/lib/services/authService";
import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import toast from "react-hot-toast";

interface AuthContextType {
  accountLogin: (payload: AccountLoginRequest) => Promise<void>;
  silentAccountLogin: (payload: AccountLoginRequest) => Promise<void>;
  accountLogout: () => Promise<void>;
  githubLogin: () => void;
  googleLogin: () => void;
  checkAuthStatus: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: any | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 只有在认证状态下才获取用户信息
  const { data: user } = useSWR(
    isAuthenticated ? "/user/me/get-my-profile" : null
  );

  const accountLogin = useCallback(
    async (payload: AccountLoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.accountLogin(payload);
        if (response.status === 200 && "data" in response) {
          // 后端返回 data: true 表示登录成功
          setIsAuthenticated(response.data);
          console.log(response.data);
          router.push("/");
        }
      } catch (error: any) {
        const errorMessage = error.error || "登录失败，请重试";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [router]
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
    [router]
  );

  const accountLogout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.accountLogout();
      if (response.status === 200 && "data" in response) {
        // 后端返回 data: true 表示登出成功
        setIsAuthenticated(false);
        router.push("/login");
      }
    } catch (error: any) {
      const errorMessage = error.error || "登出失败，请重试";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const githubLogin = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      // 直接重定向到 GitHub OAuth 授权页面
      // 不需要等待异步响应，因为页面会直接跳转
      authService.githubLogin();
    } catch (error: any) {
      const errorMessage = error.error || "GitHub 登录失败，请重试";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  }, []);

  const googleLogin = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      // 直接重定向到 Google OAuth 授权页面
      // 不需要等待异步响应，因为页面会直接跳转
      authService.googleLogin();
    } catch (error: any) {
      const errorMessage = error.error || "Google 登录失败，请重试";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await authService.checkAuthToken();
      if (response.status === 200 && "data" in response) {
        // 检查是否有有效的access_token或refresh_token
        const hasValidToken =
          response.data.access_token || response.data.refresh_token;
        setIsAuthenticated(hasValidToken);
      }
    } catch (error) {
      // 检查失败，设置为未认证状态
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
      error,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
