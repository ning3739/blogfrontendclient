import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type {
  APIResponse,
  ErrorResponse,
  HttpMethod,
  RequestOptions,
  SuccessResponse,
  SupportedLocale,
} from "@/app/types/clientType";

/**
 * HTTP 客户端 - 封装 axios，提供 i18n 和自动 token 刷新
 */
class HttpClient {
  private axiosInstance: AxiosInstance;
  private currentLocale: SupportedLocale = "en";
  private onAuthFailure?: () => void;
  private localeChangeListeners: Set<() => void> = new Set();
  // Token 刷新锁和队列
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
  }> = [];
  // 防止频繁刷新的冷却时间（防止网络抖动）
  private lastRefreshAttempt = 0;
  private readonly REFRESH_COOLDOWN = 1000; // 1秒冷却时间
  // 事件监听器（用于清理）
  private localeChangeHandler?: (event: Event) => void;

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL:
        baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.heyxiaoli.com/api/v1",
      timeout: 30000, // 30秒，适合大多数请求
      withCredentials: true, // 携带 httpOnly cookie
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
    this.setupLocaleListener();
  }

  /**
   * 设置语言
   */
  setLocale(locale: string) {
    const newLocale = this.normalizeLocale(locale);
    if (newLocale !== this.currentLocale) {
      this.currentLocale = newLocale;
      this.notifyLocaleChange();
    }
  }

  /**
   * 获取当前语言
   */
  getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  /**
   * 标准化语言代码（zh-CN/zh-TW → zh, en-US/en-GB → en）
   */
  private normalizeLocale(locale: string): SupportedLocale {
    const lower = locale.toLowerCase();
    if (lower.startsWith("zh")) return "zh";
    if (lower.startsWith("en")) return "en";
    return "en";
  }

  /**
   * 从浏览器获取语言（优先级：Cookie > 浏览器设置）
   */
  private getLocaleFromBrowser(): SupportedLocale {
    if (typeof window === "undefined") return "en";

    // 1. Cookie
    const cookieMatch = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    if (cookieMatch) {
      return this.normalizeLocale(cookieMatch[1]);
    }

    // 2. 浏览器设置
    return this.normalizeLocale(navigator.language || "en");
  }

  /**
   * 监听语言变化事件
   */
  private setupLocaleListener() {
    if (typeof window === "undefined") return;

    this.localeChangeHandler = (event: Event) => {
      const { locale } = (event as CustomEvent).detail || {};
      if (locale) this.setLocale(locale);
    };

    window.addEventListener("locale:changed", this.localeChangeHandler);
  }

  /**
   * 添加语言变化监听器
   */
  addLocaleChangeListener(listener: () => void) {
    this.localeChangeListeners.add(listener);
  }

  /**
   * 移除语言变化监听器
   */
  removeLocaleChangeListener(listener: () => void) {
    this.localeChangeListeners.delete(listener);
  }

  /**
   * 通知所有监听器
   */
  private notifyLocaleChange() {
    this.localeChangeListeners.forEach((listener) => listener());
  }

  /**
   * 触发语言变化事件
   */
  triggerLocaleChange(locale: string) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("locale:changed", {
          detail: { locale },
        }),
      );
    }
  }

  /**
   * 设置请求/响应拦截器
   */
  private setupInterceptors() {
    // 请求拦截器：自动设置语言
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const locale = this.getLocaleFromBrowser();
        this.currentLocale = locale;

        // 设置 X-Language（后端优先识别）
        // Accept-Language 由浏览器自动发送，无需手动设置
        config.headers["X-Language"] = locale;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // 响应拦截器：自动刷新 token + 统一错误处理
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<APIResponse>) => {
        return response;
      },
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config;

        // 处理 401：自动刷新 token
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !(originalRequest as unknown as { _retry?: boolean })._retry
        ) {
          const url = originalRequest.url || "";

          // 刷新端点本身返回 401/404 时不重试（防止死循环）
          if (url.includes("/auth/generate-access-token")) {
            // 刷新失败，后端已删除 cookies，直接登出
            this.isRefreshing = false;
            await this.logoutAndClearTokens();
            
            const errorResponse: ErrorResponse = {
              status: error.response?.status || 401,
              error: error.response?.data?.error || "Unauthorized",
            };
            return Promise.reject(errorResponse);
          }

          // 正在刷新：加入队列等待
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.axiosInstance(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          // 冷却时间检查：防止网络抖动时的频繁刷新
          const now = Date.now();
          if (now - this.lastRefreshAttempt < this.REFRESH_COOLDOWN) {
            const errorResponse: ErrorResponse = {
              status: 429,
              error:
                this.currentLocale === "zh"
                  ? "请求过于频繁，请稍后重试"
                  : "Too many requests. Please try again later.",
            };
            return Promise.reject(errorResponse);
          }
          this.lastRefreshAttempt = now;

          // 开始刷新
          (originalRequest as unknown as { _retry: boolean })._retry = true;
          this.isRefreshing = true;

          try {
            // 刷新 token
            await this.axiosInstance.patch("/auth/generate-access-token");

            // 刷新成功：处理队列并重试原请求
            this.processQueue(null);
            this.isRefreshing = false;

            return this.axiosInstance(originalRequest);
          } catch (refreshError: unknown) {
            // 刷新失败：处理队列并登出
            this.processQueue(refreshError);
            this.isRefreshing = false;

            // 后端已删除 cookies，直接登出
            await this.logoutAndClearTokens();

            const errorResponse: ErrorResponse = {
              status: (refreshError as AxiosError)?.response?.status || 401,
              error:
                ((refreshError as AxiosError)?.response?.data as ErrorResponse)?.error ||
                (this.currentLocale === "zh" ? "会话已过期，请重新登录" : "Session expired. Please login again."),
            };
            return Promise.reject(errorResponse);
          }
        }

        // 处理其他错误：统一格式化为 ErrorResponse
        let errorResponse: ErrorResponse;

        if (error.response) {
          const errorData = error.response.data;
          if (errorData?.error) {
            errorResponse = {
              status: errorData.status || error.response.status,
              error: errorData.error,
            };
          } else {
            errorResponse = {
              status: error.response.status,
              error: error.message || "An error occurred",
            };
          }
        } else if (error.request) {
          errorResponse = {
            status: 0,
            error:
              this.currentLocale === "zh"
                ? "网络连接失败，请检查您的网络"
                : "Network connection failed. Please check your network.",
          };
        } else {
          errorResponse = {
            status: 0,
            error:
              this.currentLocale === "zh"
                ? "请求失败，请稍后重试"
                : "Request failed. Please try again later.",
          };
        }

        return Promise.reject(errorResponse);
      },
    );
  }

  /**
   * 处理刷新队列
   */
  private processQueue(error: unknown) {
    this.failedQueue.forEach((promise) => (error ? promise.reject(error) : promise.resolve()));
    this.failedQueue = [];
  }

  /**
   * 通用请求
   */
  async request<T = unknown>(
    method: HttpMethod,
    url: string,
    options: RequestOptions = {},
  ): Promise<APIResponse<T>> {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: options.headers,
      params: options.params,
      data: options.data,
      timeout: options.timeout,
      onUploadProgress: options.uploadProgress,
    };

    const response = await this.axiosInstance.request<APIResponse<T>>(config);

    if (response.data && "message" in response.data) {
      return response.data as SuccessResponse<T>;
    }

    return {
      status: response.status,
      message: "Success",
      data: response.data as T,
    };
  }

  /**
   * GET 请求
   */
  async get<T = unknown>(url: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>("GET", url, options);
  }

  /**
   * POST 请求
   */
  async post<T = unknown>(
    url: string,
    data?: RequestOptions["data"],
    options?: RequestOptions,
  ): Promise<APIResponse<T>> {
    return this.request<T>("POST", url, { ...options, data });
  }

  /**
   * PUT 请求
   */
  async put<T = unknown>(
    url: string,
    data?: RequestOptions["data"],
    options?: RequestOptions,
  ): Promise<APIResponse<T>> {
    return this.request<T>("PUT", url, { ...options, data });
  }

  /**
   * DELETE 请求
   */
  async delete<T = unknown>(url: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>("DELETE", url, options);
  }

  /**
   * PATCH 请求
   */
  async patch<T = unknown>(
    url: string,
    data?: RequestOptions["data"],
    options?: RequestOptions,
  ): Promise<APIResponse<T>> {
    return this.request<T>("PATCH", url, { ...options, data });
  }

  /**
   * 文件上传
   */
  async upload<T = unknown>(
    url: string,
    file: File | FormData,
    options?: RequestOptions,
  ): Promise<APIResponse<T>> {
    const formData =
      file instanceof FormData
        ? file
        : (() => {
            const fd = new FormData();
            fd.append("file", file);
            return fd;
          })();

    return this.request<T>("POST", url, {
      ...options,
      data: formData,
      timeout: options?.timeout || 120000, // 上传默认 2 分钟超时
      headers: {
        ...options?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 文件下载
   */
  async download(url: string, params?: Record<string, unknown>): Promise<APIResponse<void>> {
    const response = await this.axiosInstance.get(url, {
      params,
      responseType: "blob",
      headers: {
        Accept: "application/octet-stream",
      },
    });

    // 获取文件名
    const contentDisposition = response.headers["content-disposition"];
    let filename = "download";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // 触发下载
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return {
      status: 200,
      message: this.currentLocale === "zh" ? "文件下载成功" : "File downloaded successfully",
      data: undefined,
    };
  }

  /**
   * 设置认证失败回调
   */
  setAuthFailureHandler(callback: () => void) {
    this.onAuthFailure = callback;
  }

  /**
   * 登出并清除 token
   */
  private async logoutAndClearTokens() {
    try {
      // 调用后端接口删除 httpOnly cookie
      await this.axiosInstance.delete("/auth/account-logout");
    } catch {
      // 即使失败也继续本地清理
    } finally {
      this.handleAuthFailure();
    }
  }

  /**
   * 处理认证失败
   */
  private handleAuthFailure() {
    if (this.onAuthFailure) {
      this.onAuthFailure();
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      sessionStorage.clear();

      window.dispatchEvent(
        new CustomEvent("auth:logout", {
          detail: { reason: "token_expired" },
        }),
      );

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  /**
   * 获取 axios 实例（高级用法）
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * 清理资源（防止内存泄漏）
   */
  destroy() {
    if (typeof window !== "undefined" && this.localeChangeHandler) {
      window.removeEventListener("locale:changed", this.localeChangeHandler);
      this.localeChangeHandler = undefined;
    }

    const destroyError = new Error("HttpClient destroyed");
    this.failedQueue.forEach((promise) => promise.reject(destroyError));
    this.failedQueue = [];

    this.isRefreshing = false;
    this.lastRefreshAttempt = 0;
    this.localeChangeListeners.clear();
  }
}

const httpClient = new HttpClient();

export default httpClient;
export { HttpClient };
