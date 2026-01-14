interface CookieOptions {
  days?: number;
  path?: string;
  sameSite?: "strict" | "lax" | "none";
  secure?: boolean;
}

export const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
  const { days = 365, path = "/", sameSite = "lax", secure = true } = options;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  const cookieParts = [
    `${name}=${value}`,
    `expires=${expires.toUTCString()}`,
    `path=${path}`,
    `SameSite=${sameSite}`,
  ];

  if (secure && typeof window !== "undefined" && window.location.protocol === "https:") {
    cookieParts.push("Secure");
  }

  // biome-ignore lint/suspicious/noDocumentCookie: Cookie utility function requires direct document.cookie access
  document.cookie = cookieParts.join("; ");
};

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
};

export const deleteCookie = (name: string, path = "/") => {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie utility function requires direct document.cookie access
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
};
