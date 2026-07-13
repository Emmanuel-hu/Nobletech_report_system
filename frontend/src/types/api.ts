export type ApiErrorDetail = {
  code?: string;
  path?: string;
  message?: string;
};

export type ApiSuccessEnvelope<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailureEnvelope = {
  success: false;
  message: string;
  errors?: ApiErrorDetail[];
};

export class ApiClientError extends Error {
  readonly status: number;

  readonly code: string;

  readonly details: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
