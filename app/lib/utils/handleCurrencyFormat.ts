import type { useFormatter } from "next-intl";

export type CurrencyCode = "USD" | "NZD" | "CNY" | "EUR" | "GBP";

// next-intl formatter 类型
type Formatter = ReturnType<typeof useFormatter>;

export const handleCurrencyFormat = (
  amount: number | string,
  formatter: Formatter,
  currency: CurrencyCode = "USD",
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    notation?: "standard" | "compact" | "engineering" | "scientific";
    currencyDisplay?: "symbol" | "code" | "name";
  }
): string => {
  // 将字符串转换为数字
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  // 如果无法解析为有效数字，返回原始值
  if (isNaN(numericAmount) || !isFinite(numericAmount)) {
    return String(amount);
  }

  // 默认选项
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    notation = "standard",
    currencyDisplay = "symbol",
  } = options || {};

  // 使用 next-intl 的 formatter.number 来格式化货币
  // next-intl 的 formatter.number 支持 style: 'currency' 选项
  return formatter.number(numericAmount, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
    currencyDisplay,
  } as const);
};

/**
 * 简化的货币格式化函数，使用默认选项
 *
 * @param amount - 金额数值
 * @param formatter - next-intl 的 formatter 对象
 * @param currency - 货币代码，默认为 "USD"
 * @returns 格式化后的货币字符串（默认保留2位小数，显示货币符号）
 */
export const formatCurrency = (
  amount: number | string,
  formatter: Formatter,
  currency: CurrencyCode = "USD"
): string => {
  return handleCurrencyFormat(amount, formatter, currency);
};

/**
 * 格式化货币（无小数位）
 *
 * @param amount - 金额数值
 * @param formatter - next-intl 的 formatter 对象
 * @param currency - 货币代码，默认为 "USD"
 * @returns 格式化后的货币字符串（无小数位）
 */
export const formatCurrencyInteger = (
  amount: number | string,
  formatter: Formatter,
  currency: CurrencyCode = "USD"
): string => {
  return handleCurrencyFormat(amount, formatter, currency, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * 格式化货币（紧凑格式，如 1.2K）
 *
 * @param amount - 金额数值
 * @param formatter - next-intl 的 formatter 对象
 * @param currency - 货币代码，默认为 "USD"
 * @returns 格式化后的货币字符串（紧凑格式）
 */
export const formatCurrencyCompact = (
  amount: number | string,
  formatter: Formatter,
  currency: CurrencyCode = "USD"
): string => {
  return handleCurrencyFormat(amount, formatter, currency, {
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
};
