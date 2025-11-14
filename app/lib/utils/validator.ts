interface ValidationResult {
  isValid: boolean;
  errorCode?: string;
  params?: Record<string, any>;
}

/**
 * 验证器类，用于邮箱和密码验证
 * 返回错误代码，由调用方处理翻译
 */
export class Validator {
  /**
   * 验证邮箱字段
   * @param email 邮箱地址
   * @returns 验证结果，包含错误代码
   */
  static validateEmail(email: string): ValidationResult {
    // 检查是否为空
    if (!email.trim()) {
      return {
        isValid: false,
        errorCode: "auth.validation.emailRequired",
      };
    }

    // 邮箱格式验证
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return {
        isValid: false,
        errorCode: "auth.validation.emailInvalid",
      };
    }

    return { isValid: true };
  }

  /**
   * 验证密码字段
   * @param password 密码
   * @param minLength 最小长度，默认8位
   * @returns 验证结果，包含错误代码和参数
   */
  static validatePassword(
    password: string,
    minLength: number = 8
  ): ValidationResult {
    // 检查是否为空
    if (!password.trim()) {
      return {
        isValid: false,
        errorCode: "auth.validation.passwordRequired",
      };
    }

    // 检查最小长度
    if (password.length < minLength) {
      return {
        isValid: false,
        errorCode: "auth.validation.passwordTooShort",
        params: { minLength },
      };
    }

    return { isValid: true };
  }

  /**
   * 验证登录表单
   * @param email 邮箱地址
   * @param password 密码
   * @param passwordMinLength 密码最小长度，默认8位
   * @returns 验证结果
   */
  static validateLoginForm(
    email: string,
    password: string,
    passwordMinLength: number = 8
  ): ValidationResult {
    // 验证邮箱
    const emailResult = this.validateEmail(email);
    if (!emailResult.isValid) {
      return emailResult;
    }

    // 验证密码
    const passwordResult = this.validatePassword(password, passwordMinLength);
    if (!passwordResult.isValid) {
      return passwordResult;
    }

    return { isValid: true };
  }

  /**
   * 验证用户名字段
   * @param username 用户名
   * @param minLength 最小长度，默认3位
   * @returns 验证结果，包含错误代码
   */
  static validateUsername(
    username: string,
    minLength: number = 3
  ): ValidationResult {
    // 检查是否为空
    if (!username.trim()) {
      return {
        isValid: false,
        errorCode: "auth.validation.usernameRequired",
      };
    }

    // 检查最小长度
    if (username.length < minLength) {
      return {
        isValid: false,
        errorCode: "auth.validation.usernameTooShort",
        params: { minLength },
      };
    }

    return { isValid: true };
  }

  /**
   * 验证验证码字段
   * @param code 验证码
   * @returns 验证结果，包含错误代码
   */
  static validateCode(code: string): ValidationResult {
    // 检查是否为空
    if (!code.trim()) {
      return {
        isValid: false,
        errorCode: "auth.validation.codeRequired",
      };
    }

    return { isValid: true };
  }

  /**
   * 验证注册表单
   * @param username 用户名
   * @param email 邮箱地址
   * @param code 验证码
   * @param password 密码
   * @param passwordMinLength 密码最小长度，默认8位
   * @returns 验证结果
   */
  static validateRegisterForm(
    username: string,
    email: string,
    code: string,
    password: string,
    passwordMinLength: number = 8
  ): ValidationResult {
    // 验证用户名
    const usernameResult = this.validateUsername(username);
    if (!usernameResult.isValid) {
      return usernameResult;
    }

    // 验证邮箱
    const emailResult = this.validateEmail(email);
    if (!emailResult.isValid) {
      return emailResult;
    }

    // 验证验证码
    const codeResult = this.validateCode(code);
    if (!codeResult.isValid) {
      return codeResult;
    }

    // 验证密码
    const passwordResult = this.validatePassword(password, passwordMinLength);
    if (!passwordResult.isValid) {
      return passwordResult;
    }

    return { isValid: true };
  }

  /**
   * 验证重置密码表单的所有字段
   * @param email 邮箱地址
   * @param code 验证码
   * @param password 新密码
   * @param passwordMinLength 密码最小长度，默认8位
   * @returns 验证结果
   */
  static validateResetPasswordForm(
    email: string,
    code: string,
    password: string,
    passwordMinLength: number = 8
  ): ValidationResult {
    // 验证邮箱
    const emailResult = this.validateEmail(email);
    if (!emailResult.isValid) {
      return emailResult;
    }

    // 验证验证码
    const codeResult = this.validateCode(code);
    if (!codeResult.isValid) {
      return codeResult;
    }

    // 验证密码
    const passwordResult = this.validatePassword(password, passwordMinLength);
    if (!passwordResult.isValid) {
      return passwordResult;
    }

    return { isValid: true };
  }

  /**
   * 获取验证错误的翻译消息
   * @param result 验证结果
   * @param validationT 翻译函数
   * @returns 翻译后的错误消息
   */
  static getValidationErrorMessage(
    result: ValidationResult,
    validationT: (key: string, params?: any) => string
  ): string {
    if (!result.errorCode) return "输入信息有误";

    const key = result.errorCode.replace("auth.validation.", "");
    return result.params ? validationT(key, result.params) : validationT(key);
  }

  /**
   * 验证并显示错误消息
   * @param result 验证结果
   * @param validationT 翻译函数
   * @param toast Toast显示函数
   * @returns 是否验证通过
   */
  static validateAndShowError(
    result: ValidationResult,
    validationT: (key: string, params?: any) => string,
    toast: { error: (message: string) => void }
  ): boolean {
    if (!result.isValid && result.errorCode) {
      const errorMessage = this.getValidationErrorMessage(result, validationT);
      toast.error(errorMessage);
      return false;
    }
    return true;
  }

  /**
   * 清理邮箱输入（去除首尾空格并转为小写）
   * @param email 邮箱地址
   * @returns 清理后的邮箱地址
   */
  static cleanEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}

export type { ValidationResult };
