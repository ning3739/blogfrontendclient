"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { authService } from "@/app/lib/services/authService";
import { getErrorMessage } from "@/app/lib/utils/errorHandler";
import type { AccountLoginRequest } from "@/app/types/authServiceType";
import type { User } from "@/app/types/userType";

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
  user: User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user profile only when authenticated
  const { data: user, isValidating } = useSWR(isAuthenticated ? "/user/me/get-my-profile" : null, {
    revalidateOnMount: true,
  });

  const userLoading = Boolean(isAuthenticated && (isValidating || !user));

  const accountLogin = useCallback(
    async (payload: AccountLoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.accountLogin(payload);
        if (response.status === 200 && "data" in response) {
          toast.success("message" in response ? response.message : "Login successful");
          setIsAuthenticated(true);
          router.push("/");
        } else {
          const errorMsg = "error" in response ? response.error : "Login failed";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, "登录失败，请重试");
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
          setIsAuthenticated(true);
          router.push("/");
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, "自动登录失败，请手动登录");
        setError(errorMessage);
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "登出失败，请重试");
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        `${provider === "github" ? "GitHub" : "Google"} 登录失败，请重试`,
      );
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

      if (response.status !== 200 || !("data" in response) || !response.data) {
        setIsAuthenticated(false);
        return;
      }

      const { access_token, refresh_token } = response.data;

      // Both tokens invalid - user not logged in
      if (!access_token && !refresh_token) {
        setIsAuthenticated(false);
        return;
      }

      // Has AT but no RT - abnormal state, clear cookies
      // RT was deleted from database, must re-login when AT expires
      if (access_token && !refresh_token) {
        try {
          await authService.accountLogout();
        } catch (_logoutError) {
          // Silent failure
        }
        setIsAuthenticated(false);
        return;
      }

      // Only RT, no AT - normal state, wait for auto-refresh on API call
      // AT expired but RT valid, Client.ts will handle refresh
      if (!access_token && refresh_token) {
        setIsAuthenticated(true);
        return;
      }

      // Both tokens valid - normal state
      setIsAuthenticated(true);
    } catch (_error) {
      setIsAuthenticated(false);
    }
  }, []);

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
