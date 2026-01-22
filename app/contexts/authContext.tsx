"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const pathname = usePathname();
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user profile only when authenticated
  const {
    data: user,
    isValidating,
    mutate: mutateUser,
  } = useSWR(isAuthenticated ? "/user/me/get-my-profile" : null, {
    revalidateOnMount: true,
  });

  const userLoading = Boolean(isAuthenticated && (isValidating || !user));

  /**
   * Clear local auth state
   */
  const clearAuthState = useCallback(() => {
    setIsAuthenticated(false);
    setError(null);
    mutateUser(undefined, false);
    localStorage.removeItem("user");
    sessionStorage.clear();
  }, [mutateUser]);

  /**
   * Handle force logout (token expired, etc.)
   * Triggered by HTTP Client's auth:logout event
   */
  const handleForceLogout = useCallback(
    (reason?: string) => {
      clearAuthState();

      // Avoid redirect loop on login page
      if (!pathname?.includes("/login")) {
        if (reason === "token_expired") {
          toast.error(t("sessionExpired"));
        }
        // Hard refresh to clear all cached state
        window.location.href = "/login";
      }
    },
    [clearAuthState, pathname, t],
  );

  /**
   * Listen for HTTP Client auth failure events
   */
  useEffect(() => {
    const handleAuthLogout = (event: Event) => {
      const customEvent = event as CustomEvent<{ reason?: string }>;
      handleForceLogout(customEvent.detail?.reason);
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, [handleForceLogout]);

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
        const errorMessage = getErrorMessage(error, t("loginFailed"));
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [router, t],
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
        const errorMessage = getErrorMessage(error, t("autoLoginFailed"));
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [router, t],
  );

  const accountLogout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.accountLogout();
      if (response.status === 200 && "data" in response) {
        toast.success("message" in response ? response.message : "Logout successful");
        clearAuthState();
        // Hard refresh to login page, avoid Next.js router cache detecting old auth state
        window.location.href = "/login";
      } else {
        const errorMsg = "error" in response ? response.error : "Logout failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t("logoutFailed"));
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clearAuthState, t]);

  const oauthLogin = useCallback(
    (provider: "github" | "google") => {
      setLoading(true);
      setError(null);
      try {
        provider === "github" ? authService.githubLogin() : authService.googleLogin();
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(
          error,
          provider === "github" ? t("githubLoginFailed") : t("googleLoginFailed"),
        );
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
    },
    [t],
  );

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

      // Has AT but no RT - abnormal state, force logout
      if (access_token && !refresh_token) {
        try {
          await authService.accountLogout();
        } catch {
          // Silent failure
        }
        setIsAuthenticated(false);
        return;
      }

      // Authenticated if has RT (AT will auto-refresh) or both tokens
      setIsAuthenticated(Boolean(refresh_token));
    } catch {
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
