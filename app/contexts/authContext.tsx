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

      // 【异常情况1】两个 token 都无效 - 清除 cookie
      if (!access_token && !refresh_token) {
        console.warn("Both tokens are invalid, clearing cookies");
        try {
          await authService.accountLogout();
        } catch (logoutError) {
          console.warn("Failed to clear invalid cookies:", logoutError);
        }
        setIsAuthenticated(false);
        return;
      }

      // 【异常情况2】有 access_token 但没有 refresh_token - 这是不正常的状态
      // 说明：refresh_token 可能在数据库中被删除了，access_token 过期后无法刷新
      // 处理：清除所有 cookie，要求用户重新登录
      if (access_token && !refresh_token) {
        console.warn("Access token exists but refresh token is missing, clearing cookies");
        try {
          await authService.accountLogout();
        } catch (logoutError) {
          console.warn("Failed to clear cookies:", logoutError);
        }
        setIsAuthenticated(false);
        return;
      }

      // 【主动刷新】只有 refresh_token，没有 access_token - 尝试刷新
      if (!access_token && refresh_token) {
        try {
          const refreshResponse = await authService.generateAccessToken();

          if (refreshResponse.status === 200) {
            setIsAuthenticated(true);
            return;
          }
        } catch (refreshError) {
          console.warn("Token refresh failed:", refreshError);
          // 刷新失败，清除过期的 cookie
          try {
            await authService.accountLogout();
          } catch (logoutError) {
            console.warn("Failed to clear expired cookies:", logoutError);
          }
          setIsAuthenticated(false);
          return;
        }
      }

      // 【正常情况】两个 token 都有效
      setIsAuthenticated(access_token && refresh_token);
    } catch (error) {
      console.warn("Check auth status failed:", error);
      setIsAuthenticated(false);
    }
  }, []);

  // 在组件挂载时检查认证状态
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // 监听用户活动，在用户活跃时刷新 token
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastRefreshTime = Date.now();
    const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 分钟

    const handleUserActivity = async () => {
      const now = Date.now();
      // 如果距离上次刷新超过 10 分钟，且用户有活动，则刷新
      if (now - lastRefreshTime > REFRESH_INTERVAL) {
        try {
          await authService.generateAccessToken();
          lastRefreshTime = now;
        } catch (error) {
          console.warn("Activity-based token refresh failed:", error);
        }
      }
    };

    // 监听用户活动事件
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated]);

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
