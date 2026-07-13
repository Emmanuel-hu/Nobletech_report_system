import { runtimeConfig } from '../config/runtime';
import type { AuthSession } from '../types/auth';
import type { ApiFailureEnvelope, ApiSuccessEnvelope } from '../types/api';
import { ApiClientError } from '../types/api';

const defaultHeaders: HeadersInit = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

type RequestInitWithBody = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

const toErrorCode = (status: number, errors: ApiFailureEnvelope['errors']): string => {
  if (errors && errors.length > 0 && errors[0]?.code) {
    return errors[0].code;
  }

  if (status === 401) {
    return 'UNAUTHORIZED';
  }

  if (status === 403) {
    return 'FORBIDDEN';
  }

  if (status === 404) {
    return 'NOT_FOUND';
  }

  if (status === 409) {
    return 'CONFLICT';
  }

  if (status === 422) {
    return 'VALIDATION_ERROR';
  }

  return 'HTTP_ERROR';
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInitWithBody,
  session: AuthSession,
): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        'x-user-id': session.userId,
        'x-school-id': session.schoolId,
        ...(options.headers ?? {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiClientError(0, 'NETWORK_ERROR', 'Unable to reach the API. Check network connectivity and retry.');
  }

  const text = await response.text();
  let payload: ApiSuccessEnvelope<T> | ApiFailureEnvelope | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as ApiSuccessEnvelope<T> | ApiFailureEnvelope;
    } catch {
      if (!response.ok) {
        throw new ApiClientError(response.status, 'INVALID_RESPONSE', 'The server returned an unreadable response.');
      }
    }
  }

  if (!response.ok) {
    const failure = payload as ApiFailureEnvelope | null;
    const code = toErrorCode(response.status, failure?.errors);
    const normalizedCode = code === 'CONFLICT' && failure?.errors?.[0]?.code ? failure.errors[0].code : code;

    throw new ApiClientError(
      response.status,
      normalizedCode,
      failure?.message ?? 'Request failed.',
      failure?.errors ?? [],
    );
  }

  if (!payload || !('success' in payload) || !payload.success) {
    throw new ApiClientError(500, 'INVALID_RESPONSE', 'The server returned an invalid response.');
  }

  return payload.data;
};
