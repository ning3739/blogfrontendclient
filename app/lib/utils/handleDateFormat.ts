import type { useFormatter } from "next-intl";

export type DatePrecision = "day" | "second" | "short";

type Formatter = ReturnType<typeof useFormatter>;

export const handleDateFormat = (
  data: string,
  formatter: Formatter,
  precision: DatePrecision = "second"
): string => {
  if (!data) return "";

  // ✅ 后端时间默认是 UTC，因此直接加 Z
  const date = new Date(data + "Z");

  if (isNaN(date.getTime())) return data;

  // 显示格式选项
  const options =
    precision === "short"
      ? ({ month: "short", day: "numeric" } as const)
      : precision === "day"
      ? ({
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        } as const)
      : ({
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        } as const);

  // ✅ 不指定 timeZone，让 next-intl 自动转换为用户本地时间
  return formatter.dateTime(date, options);
};
