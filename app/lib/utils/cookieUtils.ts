/**
 * Cookie 操作工具函数
 */

/**
 * 设置 cookie
 * @param name cookie 名称
 * @param value cookie 值
 * @param days 过期天数，默认为 session cookie（浏览器关闭时删除）
 */
export const setCookie = (name: string, value: string, days?: number): void => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  // biome-ignore lint/suspicious/noDocumentCookie: Direct cookie access is required for client-side cookie management
  document.cookie = `${name}=${value}${expires}; path=/`;
};

/**
 * 获取 cookie 值
 * @param name cookie 名称
 * @returns cookie 值或 null
 */
export const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
};

/**
 * 删除 cookie
 * @param name cookie 名称
 */
export const deleteCookie = (name: string): void => {
  // biome-ignore lint/suspicious/noDocumentCookie: Direct cookie access is required for client-side cookie management
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * 检查是否已点赞（基于 cookie）
 * @param blogId 博客ID
 * @returns 是否已点赞
 */
export const isBlogLiked = (blogId: number): boolean => {
  try {
    const likedBlogs = getCookie("liked_blogs");
    if (!likedBlogs) return false;
    const likedBlogIds = JSON.parse(likedBlogs);
    return Array.isArray(likedBlogIds) && likedBlogIds.includes(blogId);
  } catch {
    return false;
  }
};

/**
 * 设置博客点赞状态
 * @param blogId 博客ID
 * @param isLiked 是否点赞
 */
export const setBlogLikeStatus = (blogId: number, isLiked: boolean): void => {
  let likedBlogIds: number[] = [];

  try {
    const likedBlogs = getCookie("liked_blogs");
    if (likedBlogs) {
      const parsed = JSON.parse(likedBlogs);
      likedBlogIds = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    likedBlogIds = [];
  }

  likedBlogIds = isLiked
    ? likedBlogIds.includes(blogId)
      ? likedBlogIds
      : [...likedBlogIds, blogId]
    : likedBlogIds.filter((id) => id !== blogId);

  likedBlogIds.length > 0
    ? setCookie("liked_blogs", JSON.stringify(likedBlogIds))
    : deleteCookie("liked_blogs");
};
