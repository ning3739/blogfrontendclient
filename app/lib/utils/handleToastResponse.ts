import toast from "react-hot-toast";
import type {
  APIResponse,
  SuccessResponse,
  ErrorResponse,
} from "@/app/types/clientType";

/**
 * 统一处理 API 响应，自动显示成功或错误提示
 *
 * 特点：
 * - 自动处理所有类型的错误（服务器错误、网络错误等）
 * - 支持国际化的错误消息
 * - 无需 try-catch，httpClient 已统一格式化
 *
 * @param response - API 响应对象（成功或失败）
 */
export const handleToastResponse = (response: APIResponse) => {
  // Handle success response (status 200)
  if (response.status === 200) {
    toast.success((response as SuccessResponse).message);
  } else {
    // Handle error response (status !== 200)
    // httpClient 已确保所有错误都有 error 字段，包括网络错误
    toast.error((response as ErrorResponse).error);
  }
};
