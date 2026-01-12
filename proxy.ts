import { type NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/reset-password"];
const PROTECTED_PAGES = ["/dashboard"];

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  const isProtectedPage = PROTECTED_PAGES.some((page) =>
    pathname.startsWith(page)
  );

  // 检查认证状态的通用函数
  const checkAuth = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/check-auth-token`;

      // 获取请求中的所有 cookies，构建 Cookie 头
      const cookies = request.cookies.getAll();
      const cookieHeader = cookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

      // 调用 API 检查认证状态
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Cookie: cookieHeader || "",
          "Content-Type": "application/json",
          "User-Agent": request.headers.get("user-agent") || "",
          Accept: request.headers.get("accept") || "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        
        // 【主动刷新】如果只有 refresh_token，尝试刷新 access_token
        // 注意：middleware 中无法直接接收后端设置的 cookie
        // 所以我们采用"允许通过"的策略，让客户端 authContext 来处理刷新
        if (data && data.refresh_token === true && data.access_token === false) {
          // 有有效的 refresh_token，允许访问，让客户端处理刷新
          return true;
        }
        
        return data && data.access_token === true;
      }
      return false;
    } catch (error) {
      console.debug("API server not available");
      return false;
    }
  };

  // 处理认证页面：已登录用户重定向到首页
  if (isAuthPage) {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      const response = NextResponse.redirect(new URL("/", request.url));
      // 禁用缓存，确保每次都重新检查认证状态
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }
  }

  // 处理受保护页面：未登录用户重定向到登录页
  if (isProtectedPage) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }
  }

  const response = NextResponse.next();
  // 对于认证相关页面，禁用缓存
  if (isAuthPage || isProtectedPage) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }
  return response;
}

export const config = {
  matcher: ["/login", "/register", "/reset-password", "/dashboard/:path*"],
};
