import httpClient from "./client";

// SWR 专用的 fetcher 函数 - 支持字符串或数组key
export const fetcher = async (
  key: string | [string, ...any[]]
): Promise<any> => {
  // 如果key是数组，取第一个元素作为URL（其他元素用于缓存区分，如语言）
  const url = Array.isArray(key) ? key[0] : key;
  const response = await httpClient.get(url);
  // 检查是否是成功响应，ErrorResponse 没有 data 属性
  if ("error" in response) {
    // 保留后端短错误响应的状态码，便于组件使用 error.status 判断
    const err: any = new Error(response.error);
    err.status = response.status;
    throw err;
  }
  return response.data;
};

// 默认导出
export default fetcher;
