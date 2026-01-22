export interface ApiError {
  error: string;
  status?: number;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as ApiError).error === "string"
  );
}

export function getErrorMessage(error: unknown, defaultMessage = "Operation failed"): string {
  if (isApiError(error)) {
    return error.error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}
