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

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.heyxiaoli.com/api/v1",
  timeout: 30000,
  uploadTimeout: 120000,
  refreshCooldown: 1000,
} as const;

const AUTH_ENDPOINTS = {
  refresh: "/auth/generate-access-token",
  logout: "/auth/account-logout",
} as const;

// ============================================================================
// HttpClient
// ============================================================================

class HttpClient {
  private axios: AxiosInstance;
  private locale: SupportedLocale = "en";
  private onAuthFailure?: () => void;
  private localeListeners = new Set<() => void>();
  private localeEventHandler?: (e: Event) => void;

  // Token refresh state
  private refreshing = false;
  private refreshQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = [];
  private lastRefreshTime = 0;

  constructor(baseURL?: string) {
    this.axios = axios.create({
      baseURL: baseURL || DEFAULT_CONFIG.baseURL,
      timeout: DEFAULT_CONFIG.timeout,
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
    this.setupLocaleListener();
  }

  // ==========================================================================
  // Interceptors
  // ==========================================================================

  private setupRequestInterceptor() {
    this.axios.interceptors.request.use((config) => {
      this.locale = this.detectLocale();
      config.headers["X-Language"] = this.locale;
      return config;
    });
  }

  private setupResponseInterceptor() {
    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => this.handleResponseError(error),
    );
  }

  private async handleResponseError(error: AxiosError<ErrorResponse>): Promise<never> {
    const { response, config: request } = error;
    const status = response?.status;

    // Only handle 401 for token refresh
    if (status === 401 && request && !this.isRetryRequest(request)) {
      return this.handle401Error(error, request);
    }

    // All other errors: format and reject
    throw this.formatError(error);
  }

  // ==========================================================================
  // 401 Error Handling & Token Refresh
  // ==========================================================================

  private async handle401Error(
    error: AxiosError<ErrorResponse>,
    request: AxiosRequestConfig,
  ): Promise<never> {
    const url = request.url || "";

    // Refresh endpoint itself failed - don't retry
    if (url.includes(AUTH_ENDPOINTS.refresh)) {
      this.refreshing = false;
      await this.triggerLogout();
      throw this.formatError(error);
    }

    // Already refreshing - queue this request
    if (this.refreshing) {
      return this.queueRequest(request);
    }

    // Cooldown check - prevent rapid refresh attempts
    if (!this.canRefresh()) {
      throw this.createError(429, this.t("tooManyRequests"));
    }

    // Attempt token refresh
    return this.refreshTokenAndRetry(request);
  }

  private async refreshTokenAndRetry(request: AxiosRequestConfig): Promise<never> {
    this.markAsRetry(request);
    this.refreshing = true;
    this.lastRefreshTime = Date.now();

    try {
      await this.axios.patch(AUTH_ENDPOINTS.refresh);
      this.resolveQueue();
      return this.axios(request) as Promise<never>;
    } catch (refreshError) {
      this.rejectQueue(refreshError);
      const status = (refreshError as AxiosError)?.response?.status;

      // Only logout on auth failures (401/403), not on 404 or other errors
      if (status === 401 || status === 403) {
        await this.triggerLogout();
      }

      throw this.createError(
        status || 401,
        (refreshError as AxiosError<ErrorResponse>)?.response?.data?.error ||
          this.t("sessionExpired"),
      );
    } finally {
      this.refreshing = false;
    }
  }

  private queueRequest(request: AxiosRequestConfig): Promise<never> {
    return new Promise((resolve, reject) => {
      this.refreshQueue.push({
        resolve: () => resolve(this.axios(request) as never),
        reject,
      });
    });
  }

  private resolveQueue() {
    this.refreshQueue.forEach((p) => p.resolve());
    this.refreshQueue = [];
  }

  private rejectQueue(error: unknown) {
    this.refreshQueue.forEach((p) => p.reject(error));
    this.refreshQueue = [];
  }

  private canRefresh(): boolean {
    return Date.now() - this.lastRefreshTime >= DEFAULT_CONFIG.refreshCooldown;
  }

  private isRetryRequest(request: AxiosRequestConfig): boolean {
    return (request as { _retry?: boolean })._retry === true;
  }

  private markAsRetry(request: AxiosRequestConfig) {
    (request as { _retry: boolean })._retry = true;
  }

  // ==========================================================================
  // Error Formatting
  // ==========================================================================

  private formatError(error: AxiosError<ErrorResponse>): ErrorResponse {
    const { response, request } = error;

    if (response?.data?.error) {
      return { status: response.data.status || response.status, error: response.data.error };
    }

    if (response) {
      return { status: response.status, error: error.message || "An error occurred" };
    }

    if (request) {
      return { status: 0, error: this.t("networkError") };
    }

    return { status: 0, error: this.t("requestFailed") };
  }

  private createError(status: number, error: string): ErrorResponse {
    return { status, error };
  }

  // ==========================================================================
  // Auth
  // ==========================================================================

  private async triggerLogout() {
    try {
      // Use raw axios to avoid interceptor loops
      await axios.delete(`${this.axios.defaults.baseURL}${AUTH_ENDPOINTS.logout}`, {
        withCredentials: true,
      });
    } catch {
      // Continue with local cleanup even if server logout fails
    }
    this.emitAuthFailure();
  }

  private emitAuthFailure() {
    if (this.onAuthFailure) {
      this.onAuthFailure();
      return;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:logout", { detail: { reason: "token_expired" } }));
    }
  }

  setAuthFailureHandler(callback: () => void) {
    this.onAuthFailure = callback;
  }

  // ==========================================================================
  // Locale
  // ==========================================================================

  private detectLocale(): SupportedLocale {
    if (typeof window === "undefined") return "en";

    const cookie = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    const raw = cookie?.[1] || navigator.language || "en";

    return raw.toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  private setupLocaleListener() {
    if (typeof window === "undefined") return;

    this.localeEventHandler = (e: Event) => {
      const locale = (e as CustomEvent).detail?.locale;
      if (locale) this.setLocale(locale);
    };

    window.addEventListener("locale:changed", this.localeEventHandler);
  }

  setLocale(locale: string) {
    const normalized = locale.toLowerCase().startsWith("zh") ? "zh" : "en";
    if (normalized !== this.locale) {
      this.locale = normalized;
      this.localeListeners.forEach((fn) => fn());
    }
  }

  getLocale(): SupportedLocale {
    return this.locale;
  }

  triggerLocaleChange(locale: string) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("locale:changed", { detail: { locale } }));
    }
  }

  addLocaleChangeListener(fn: () => void) {
    this.localeListeners.add(fn);
  }

  removeLocaleChangeListener(fn: () => void) {
    this.localeListeners.delete(fn);
  }

  // Simple i18n helper
  private t(key: string): string {
    const messages: Record<string, Record<SupportedLocale, string>> = {
      tooManyRequests: {
        zh: "请求过于频繁，请稍后重试",
        en: "Too many requests. Please try again later.",
      },
      sessionExpired: { zh: "会话已过期，请重新登录", en: "Session expired. Please login again." },
      networkError: {
        zh: "网络连接失败，请检查您的网络",
        en: "Network connection failed. Please check your network.",
      },
      requestFailed: { zh: "请求失败，请稍后重试", en: "Request failed. Please try again later." },
      downloadSuccess: { zh: "文件下载成功", en: "File downloaded successfully" },
    };
    return messages[key]?.[this.locale] || key;
  }

  // ==========================================================================
  // HTTP Methods
  // ==========================================================================

  private async request<T>(
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

    const response = await this.axios.request<APIResponse<T>>(config);

    return "message" in response.data
      ? (response.data as SuccessResponse<T>)
      : { status: response.status, message: "Success", data: response.data as T };
  }

  async get<T = unknown>(url: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>("GET", url, options);
  }

  async post<T = unknown>(
    url: string,
    data?: RequestOptions["data"],
    options?: RequestOptions,
  ): Promise<APIResponse<T>> {
    return this.request<T>("POST", url, { ...options, data });
  }

  async put<T = unknown>(
    url: string,
    data?: RequestOptions["data"],
    options?: RequestOptions,
  ): Promise<APIResponse<T>> {
    return this.request<T>("PUT", url, { ...options, data });
  }

  async patch<T = unknown>(
    url: string,
    data?: RequestOptions["data"],
    options?: RequestOptions,
  ): Promise<APIResponse<T>> {
    return this.request<T>("PATCH", url, { ...options, data });
  }

  async delete<T = unknown>(url: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>("DELETE", url, options);
  }

  async upload<T = unknown>(
    url: string,
    file: File | FormData,
    options?: RequestOptions,
  ): Promise<APIResponse<T>> {
    const formData = file instanceof FormData ? file : this.createFormData(file);

    return this.request<T>("POST", url, {
      ...options,
      data: formData,
      timeout: options?.timeout || DEFAULT_CONFIG.uploadTimeout,
      headers: { ...options?.headers, "Content-Type": "multipart/form-data" },
    });
  }

  private createFormData(file: File): FormData {
    const fd = new FormData();
    fd.append("file", file);
    return fd;
  }

  async download(url: string, params?: Record<string, unknown>): Promise<APIResponse<void>> {
    const response = await this.axios.get(url, {
      params,
      responseType: "blob",
      headers: { Accept: "application/octet-stream" },
    });

    const filename = this.extractFilename(response) || "download";
    this.triggerDownload(response.data, filename);

    return { status: 200, message: this.t("downloadSuccess"), data: undefined };
  }

  private extractFilename(response: AxiosResponse): string | null {
    const header = response.headers["content-disposition"];
    const match = header?.match(/filename="([^"]+)"/);
    return match?.[1] || null;
  }

  private triggerDownload(data: Blob, filename: string) {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  getAxiosInstance(): AxiosInstance {
    return this.axios;
  }

  destroy() {
    if (typeof window !== "undefined" && this.localeEventHandler) {
      window.removeEventListener("locale:changed", this.localeEventHandler);
    }

    this.refreshQueue.forEach((p) => p.reject(new Error("HttpClient destroyed")));
    this.refreshQueue = [];
    this.refreshing = false;
    this.lastRefreshTime = 0;
    this.localeListeners.clear();
  }
}

// ============================================================================
// Export
// ============================================================================

const httpClient = new HttpClient();

export default httpClient;
export { HttpClient };
