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
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${value}${expires}; path=/`;
};

/**
 * 获取 cookie 值
 * @param name cookie 名称
 * @returns cookie 值或 null
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * 删除 cookie
 * @param name cookie 名称
 */
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * 检查是否已点赞（基于 cookie）
 * @param blogId 博客ID
 * @returns 是否已点赞
 */
export const isBlogLiked = (blogId: number): boolean => {
  const likedBlogs = getCookie("liked_blogs");
  if (!likedBlogs) return false;

  try {
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
  const likedBlogs = getCookie("liked_blogs");
  let likedBlogIds: number[] = [];

  if (likedBlogs) {
    try {
      likedBlogIds = JSON.parse(likedBlogs);
      if (!Array.isArray(likedBlogIds)) {
        likedBlogIds = [];
      }
    } catch {
      likedBlogIds = [];
    }
  }

  if (isLiked) {
    // 添加点赞
    if (!likedBlogIds.includes(blogId)) {
      likedBlogIds.push(blogId);
    }
  } else {
    // 取消点赞
    likedBlogIds = likedBlogIds.filter((id) => id !== blogId);
  }

  // 更新 cookie
  if (likedBlogIds.length > 0) {
    setCookie("liked_blogs", JSON.stringify(likedBlogIds));
  } else {
    deleteCookie("liked_blogs");
  }
};
