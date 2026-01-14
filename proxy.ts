import { type NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/reset-password"];
const PROTECTED_PAGES = ["/dashboard"];

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  const isProtectedPage = PROTECTED_PAGES.some((page) => pathname.startsWith(page));

  const hasAuthCookies = () => {
    const accessToken = request.cookies.get("access_token");
    const refreshToken = request.cookies.get("refresh_token");
    return !!(accessToken || refreshToken);
  };

  if (isAuthPage) {
    if (hasAuthCookies()) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }
  }

  if (isProtectedPage) {
    if (!hasAuthCookies()) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/reset-password", "/dashboard/:path*"],
};
