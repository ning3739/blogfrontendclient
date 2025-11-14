import { AxiosProgressEvent } from "axios";

interface Status {
  status: number;
}

export interface SuccessResponse<T = unknown> extends Status {
  message: string;
  data?: T; // 后端使用 Optional[Any]，前端对应 T | undefined
}

export interface ErrorResponse extends Status {
  error: string; // 后端返回的是字符串，httpClient 保证一定有值
}

export type APIResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
  uploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

/**
 * 语言设置类型
 */
export type SupportedLocale = "zh" | "en";
