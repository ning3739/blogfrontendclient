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
 * HTTP客户端类，封装axios并提供i18n支持
 * 与backend-server的i18n机制完全对应
 */
class HttpClient {
  private axiosInstance: AxiosInstance;
  private currentLocale: SupportedLocale = "en";
  private onAuthFailure?: () => void;
  private localeChangeListeners: Set<() => void> = new Set();
  // Token刷新相关的锁和队列
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
  }> = [];
  // 刷新次数限制（防止无限重试）
  private refreshRetryCount = 0;
  private readonly MAX_REFRESH_RETRIES = 2;
  // 事件监听器引用（用于清理）
  private localeChangeHandler?: (event: Event) => void;

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL:
        baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.heyxiaoli.com/api/v1",
      timeout: 10000,
      withCredentials: true, // 重要：确保包含httpOnly cookie
      headers: {
        "Content-Type": "application/json",
      },
      // 禁用代理检测以避免url.parse()的使用， 生产环境需要开启代理
      proxy: false,
    });

    this.setupInterceptors();
    this.setupLocaleListener();
  }

  /**
   * 设置当前语言环境
   */
  setLocale(locale: string) {
    const newLocale = this.normalizeLocale(locale);
    if (newLocale !== this.currentLocale) {
      this.currentLocale = newLocale;
      // 通知所有监听器语言已变化
      this.notifyLocaleChange();
    }
  }

  /**
   * 获取当前语言环境
   */
  getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  /**
   * 标准化语言代码，与后端保持一致
   */
  private normalizeLocale(locale: string): SupportedLocale {
    return locale.toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  /**
   * 从浏览器获取当前语言环境
   */
  private getLocaleFromBrowser(): SupportedLocale {
    if (typeof window === "undefined") return "en";

    // 1. 优先从cookie读取
    const cookieMatch = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    if (cookieMatch) {
      return this.normalizeLocale(cookieMatch[1]);
    }

    // 2. 从浏览器语言设置获取
    return this.normalizeLocale(navigator.language || "en");
  }

  /**
   * 设置语言变化监听
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
   * 通知所有监听器语言已变化
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
   * 设置拦截器
   */
  private setupInterceptors() {
    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // 自动检测并设置语言
        const locale = this.getLocaleFromBrowser();
        this.currentLocale = locale;

        // 设置X-Language请求头（后端优先识别）
        config.headers["X-Language"] = locale;

        // 设置Accept-Language请求头（后端备用识别）
        config.headers["Accept-Language"] =
          locale === "zh" ? "zh-CN,zh;q=0.9,en;q=0.8" : "en-US,en;q=0.9";

        // httpOnly cookie会自动包含在请求中，无需手动设置Authorization头
        // 确保credentials设置为'include'以包含cookie
        config.withCredentials = true;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<APIResponse>) => {
        return response;
      },
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config;

        // 【自动刷新】处理401错误 - 根据endpoint类型决定是否需要token刷新
        // 说明：这是使用过程中的透明刷新，当 API 返回 401 时自动触发
        // 与 authContext 中的主动刷新（页面加载时）互补，确保会话持续性
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !(originalRequest as unknown as { _retry?: boolean })._retry
        ) {
          const url = originalRequest.url || "";

          // 定义不需要重试的端点
          // 说明：
          // 1. /auth/generate-access-token 必须保留（防止无限循环）
          // 2. 其他端点可删除（逻辑上都能处理），但保留可以避免401时的无效刷新
          const noRetryEndpoints = [
            // 认证相关的公开端点（登录、注册等不需要token）
            "/auth/send-verification-code",
            "/auth/send-reset-code",
            "/auth/create-user-account",
            "/auth/reset-user-password",
            "/auth/account-login",
            "/auth/check-auth-token",
            "/auth/github-login",
            "/auth/google-login",
            "/auth/account-logout",

            // 特殊端点（防止无限循环）
            "/auth/generate-access-token", // ⚠️ 必须保留，否则会死循环
          ];

          // 如果是不需要重试的端点，直接返回401错误
          if (noRetryEndpoints.some((endpoint) => url.includes(endpoint))) {
            const errorResponse: ErrorResponse = {
              status: error.response?.status || 401,
              error: error.response?.data?.error || "Unauthorized",
            };
            return Promise.reject(errorResponse);
          }

          // 如果正在刷新token，将请求加入队列等待刷新完成
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                // 刷新成功后，重新发送原始请求
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => {
                // 刷新失败，返回错误
                return Promise.reject(err);
              });
          }

          // 检查刷新次数限制
          if (this.refreshRetryCount >= this.MAX_REFRESH_RETRIES) {
            // 超过最大重试次数，直接登出
            this.refreshRetryCount = 0;
            await this.logoutAndClearTokens();
            const errorResponse: ErrorResponse = {
              status: 401,
              error:
                this.currentLocale === "zh"
                  ? "会话已过期，请重新登录"
                  : "Session expired. Please login again.",
            };
            return Promise.reject(errorResponse);
          }

          // 标记请求为已重试，防止重复处理
          (originalRequest as unknown as { _retry: boolean })._retry = true;
          // 设置刷新锁，防止并发刷新
          this.isRefreshing = true;
          // 增加刷新计数
          this.refreshRetryCount++;

          try {
            // 尝试刷新token
            await this.axiosInstance.patch("/auth/generate-access-token");

            // 刷新成功，重置计数
            this.refreshRetryCount = 0;
            // 处理队列中的所有请求
            this.processQueue(null);
            this.isRefreshing = false;

            // 重新发送原始请求，如果再次401则登出
            return this.axiosInstance(originalRequest).catch((retryError: unknown) => {
              // 如果刷新后的请求仍然返回401，说明token仍有问题
              if ((retryError as AxiosError)?.response?.status === 401) {
                // 重置计数并登出
                this.refreshRetryCount = 0;
                this.logoutAndClearTokens();
              }
              return Promise.reject(retryError);
            });
          } catch (refreshError: unknown) {
            // 刷新失败，处理队列中的所有请求
            this.processQueue(refreshError);
            this.isRefreshing = false;

            // 获取刷新失败的状态码
            const refreshStatus =
              (refreshError as AxiosError)?.status ||
              (refreshError as AxiosError)?.response?.status ||
              ((refreshError as AxiosError)?.request ? 0 : 500);

            // 判断刷新失败的原因
            const shouldLogout = this.shouldLogoutOnRefreshFailure(refreshStatus);

            if (shouldLogout) {
              // Token失效或不存在，需要登出
              this.refreshRetryCount = 0;
              await this.logoutAndClearTokens();
            } else {
              // 网络错误或服务器错误，不立即登出，允许用户重试
              // 注意：这里不重置 refreshRetryCount，下次仍会检查重试次数
            }

            // 统一返回 ErrorResponse 格式
            const errorResponse: ErrorResponse = {
              status: refreshStatus,
              error: this.getRefreshErrorMessage(
                refreshStatus,
                (refreshError as ErrorResponse)?.error ||
                  ((refreshError as AxiosError)?.response?.data as ErrorResponse)?.error,
              ),
            };
            return Promise.reject(errorResponse);
          }
        }

        // 处理其他类型的错误，统一返回 ErrorResponse 格式
        let errorResponse: ErrorResponse;

        if (error.response) {
          // 服务器响应了错误状态码
          const errorData = error.response.data;

          // 如果后端返回了本地化的错误消息，直接使用
          if (errorData?.error) {
            errorResponse = {
              status: errorData.status || error.response.status,
              error: errorData.error,
            };
          } else {
            // 后端没有返回标准格式，包装一下
            errorResponse = {
              status: error.response.status,
              error: error.message || "An error occurred",
            };
          }
        } else if (error.request) {
          // 网络错误（请求已发送但没有收到响应）
          errorResponse = {
            status: 0,
            error:
              this.currentLocale === "zh"
                ? "网络连接失败，请检查您的网络"
                : "Network connection failed. Please check your network.",
          };
        } else {
          // 请求配置错误或其他错误
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
   * 判断刷新失败时是否应该登出
   * @param status 刷新请求返回的状态码
   * @returns true表示需要登出，false表示可能是网络错误，可以重试
   */
  private shouldLogoutOnRefreshFailure(status: number): boolean {
    // 401: token无效/过期
    // 404: refresh token不存在（已被删除或过期）
    // 403: 权限不足（可能是token被撤销）
    if (status === 401 || status === 404 || status === 403) {
      return true;
    }

    // 429: 速率限制（暂时不登出，但会受重试次数限制）
    // 0: 网络错误（不登出，允许重试）
    // 500+: 服务器错误（不登出，允许重试）
    return false;
  }

  /**
   * 获取刷新token失败时的错误消息（支持本地化）
   * @param status 错误状态码
   * @param serverMessage 服务器返回的错误消息
   * @returns 本地化的错误消息
   */
  private getRefreshErrorMessage(status: number, serverMessage?: string): string {
    // 优先使用服务器返回的错误消息
    if (serverMessage) {
      return serverMessage;
    }

    // 根据状态码返回本地化消息
    const isZh = this.currentLocale === "zh";

    switch (status) {
      case 401:
        return isZh
          ? "认证令牌无效，请重新登录"
          : "Authentication token invalid. Please login again.";
      case 404:
        return isZh ? "刷新令牌不存在，请重新登录" : "Refresh token not found. Please login again.";
      case 403:
        return isZh ? "权限不足，请重新登录" : "Insufficient permissions. Please login again.";
      case 429:
        return isZh ? "请求过于频繁，请稍后重试" : "Too many requests. Please try again later.";
      case 0:
        return isZh
          ? "网络连接失败，请检查网络后重试"
          : "Network connection failed. Please check your network and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return isZh ? "服务器错误，请稍后重试" : "Server error. Please try again later.";
      default:
        return isZh ? "会话已过期，请重新登录" : "Session expired. Please login again.";
    }
  }

  /**
   * 处理等待刷新完成的请求队列
   * @param error 如果刷新失败，传入错误对象；如果刷新成功，传入null
   */
  private processQueue(error: unknown) {
    this.failedQueue.forEach((promise) => (error ? promise.reject(error) : promise.resolve()));
    this.failedQueue = [];
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(
    method: HttpMethod,
    url: string,
    options: RequestOptions = {},
  ): Promise<APIResponse<T>> {
    try {
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

      // 确保返回成功响应
      if (response.data && "message" in response.data) {
        return response.data as SuccessResponse<T>;
      }

      // 如果响应格式不符合预期，包装一下
      return {
        status: response.status,
        message: "Success",
        data: response.data as T,
      };
    } catch (error: unknown) {
      // 拦截器已经将错误统一格式化为 ErrorResponse
      // 这里直接返回错误对象而不是抛出，这样调用方可以统一处理
      return error as ErrorResponse;
    }
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>("GET", url, options);
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>("POST", url, { ...options, data });
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>("PUT", url, { ...options, data });
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>("DELETE", url, options);
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>("PATCH", url, { ...options, data });
  }

  /**
   * 文件上传
   */
  async upload<T = any>(
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
      headers: {
        ...options?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * 文件下载
   */
  async download(
    url: string,
    params?: Record<string, unknown>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.axiosInstance.get(url, {
        params,
        responseType: "blob",
        headers: {
          Accept: "application/octet-stream",
        },
      });

      // 从响应头获取文件名
      const contentDisposition = response.headers["content-disposition"];
      let filename = "download";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // 创建blob URL并触发下载
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: "文件下载成功" };
    } catch (error: unknown) {
      console.error("下载失败:", error);
      throw error;
    }
  }

  /**
   * 设置认证失败回调
   */
  setAuthFailureHandler(callback: () => void) {
    this.onAuthFailure = callback;
  }

  /**
   * 调用后端logout并清除cookie中的token
   */
  private async logoutAndClearTokens() {
    try {
      // 调用后端logout接口，删除cookie中的access token和refresh token
      // 注意：前端JavaScript无法直接删除httpOnly cookie，必须通过后端接口
      await this.axiosInstance.delete("/auth/account-logout");
    } catch (error) {
      // 即使logout接口调用失败也要继续执行本地清理
      console.warn("Backend logout failed:", error);
    } finally {
      // 执行本地登出处理
      this.handleAuthFailure();
    }
  }

  /**
   * 处理认证失败 - 清除状态并跳转登录页
   */
  private handleAuthFailure() {
    // 优先使用自定义回调
    if (this.onAuthFailure) {
      this.onAuthFailure();
      return;
    }

    // 默认处理逻辑
    if (typeof window !== "undefined") {
      // 清除可能的本地存储数据
      localStorage.removeItem("user");
      sessionStorage.clear();

      // 触发自定义事件，通知应用层处理登出
      window.dispatchEvent(
        new CustomEvent("auth:logout", {
          detail: { reason: "token_expired" },
        }),
      );

      // 跳转到登录页（如果当前不在登录页）
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  /**
   * 获取axios实例（用于高级用法）
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * 清理资源 - 移除事件监听器和请求队列
   * 主要用于组件卸载或应用关闭时清理资源，防止内存泄漏
   */
  destroy() {
    // 清理事件监听器
    if (typeof window !== "undefined" && this.localeChangeHandler) {
      window.removeEventListener("locale:changed", this.localeChangeHandler);
      this.localeChangeHandler = undefined;
    }

    // 清理请求队列
    const destroyError = new Error("HttpClient destroyed");
    this.failedQueue.forEach((promise) => promise.reject(destroyError));
    this.failedQueue = [];

    // 重置刷新相关状态
    this.isRefreshing = false;
    this.refreshRetryCount = 0;

    // 清理语言变化监听器
    this.localeChangeListeners.clear();
  }
}

// 创建默认实例
const httpClient = new HttpClient();

export default httpClient;
export { HttpClient };
