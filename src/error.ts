export type AppErrorCode = 'network' | 'http' | 'data' | 'unknown';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

export function toAppError(error: unknown, fallback = '發生未知錯誤'): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof TypeError && /fetch|network|failed to fetch/i.test(error.message)) {
    return new AppError('network', '網路連線失敗，請檢查網路後再試。', error);
  }
  if (error instanceof Error) return new AppError('unknown', error.message || fallback, error);
  return new AppError('unknown', fallback, error);
}

export function dataError(message: string, cause?: unknown): AppError {
  return new AppError('data', message, cause);
}

export function httpError(resource: string, status: number): AppError {
  return new AppError('http', `${resource} 載入失敗（HTTP ${status}）`, { resource, status });
}
