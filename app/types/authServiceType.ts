export interface Email {
  email: string;
}

interface Code {
  code: string;
}

interface Password {
  password: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SendVerificationCodeRequest extends Email {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SendResetCodeRequest extends Email {}

export interface CreateUserAccountRequest extends Email, Password, Code {
  username: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ResetUserPasswordRequest extends Email, Password, Code {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ResetLoggedInUserPasswordRequest extends Password {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AccountLoginRequest extends Email, Password {}
