export class HttpError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function httpError(statusCode: number, code: string, message: string) {
  return new HttpError(statusCode, code, message);
}

export function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'HttpError' &&
    typeof (error as { statusCode?: unknown }).statusCode === 'number' &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

