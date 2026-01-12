import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { forwardRef } from "react";

interface InputFieldProps {
  type: "email" | "password" | "text" | "textarea";
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  showPassword?: boolean;
  setShowPassword?: (show: boolean) => void;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

const InputField = forwardRef<HTMLTextAreaElement | HTMLInputElement, InputFieldProps>(
  (
    {
      type,
      id,
      value,
      onChange,
      onKeyDown,
      placeholder,
      showPassword,
      setShowPassword,
      required,
      autoComplete,
      disabled,
      rows = 3,
      className,
    },
    ref,
  ) => {
    const baseClassName =
      className ||
      "w-full rounded-sm border border-border-100 bg-background-50 px-4 py-3 text-foreground-50 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-[border-color,box-shadow] duration-200 hover:border-foreground-300";

    return (
      <div className="relative">
        {type === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={id}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={`${baseClassName} scrollbar-hide`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={showPassword ? "text" : type}
            id={id}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            disabled={disabled}
            className={baseClassName}
          />
        )}
        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-200 hover:text-foreground-400 transition-colors"
            onClick={() => setShowPassword?.(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default InputField;
