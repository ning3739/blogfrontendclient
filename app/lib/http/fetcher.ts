import httpClient from "./client";

// SWR 专用的 fetcher 函数 - 支持字符串或数组key
export const fetcher = async (key: string | [string, ...unknown[]]): Promise<unknown> => {
  const url = Array.isArray(key) ? key[0] : key;
  const response = await httpClient.get(url);

  if ("error" in response) {
    const error = new Error(response.error) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.data;
};

// 默认导出
export default fetcher;
