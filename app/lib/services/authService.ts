import type {
  AccountLoginRequest,
  CheckAuthTokenResponse,
  CreateUserAccountRequest,
  ResetLoggedInUserPasswordRequest,
  ResetUserPasswordRequest,
  SendResetCodeRequest,
  SendVerificationCodeRequest,
} from "@/app/types/authServiceType";
import type { APIResponse } from "@/app/types/clientType";
import httpClient from "../http/client";

class AuthService {
  async sendVerificationCode(payload: SendVerificationCodeRequest) {
    return httpClient.post("/auth/send-verification-code", payload);
  }

  async sendResetCode(payload: SendResetCodeRequest) {
    return httpClient.post("/auth/send-reset-code", payload);
  }

  async createUserAccount(payload: CreateUserAccountRequest) {
    return httpClient.post("/auth/create-user-account", payload);
  }

  async resetUserPassword(payload: ResetUserPasswordRequest) {
    return httpClient.post("/auth/reset-user-password", payload);
  }

  async resetLoggedInUserPassword(payload: ResetLoggedInUserPasswordRequest) {
    return httpClient.post("/auth/reset-logged-in-user-password", payload);
  }

  async accountLogin(payload: AccountLoginRequest) {
    return httpClient.post("/auth/account-login", payload);
  }

  async silentAccountLogin(payload: AccountLoginRequest) {
    return httpClient.post("/auth/account-login", payload);
  }

  githubLogin() {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    window.location.href = `${backendUrl}/auth/github-login`;
  }

  googleLogin() {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    window.location.href = `${backendUrl}/auth/google-login`;
  }

  async accountLogout() {
    return httpClient.delete("/auth/account-logout");
  }

  async checkAuthToken(): Promise<APIResponse<CheckAuthTokenResponse>> {
    return httpClient.get<CheckAuthTokenResponse>("/auth/check-auth-token");
  }

  async generateAccessToken() {
    return httpClient.patch("/auth/generate-access-token");
  }
}

export const authService = new AuthService();
