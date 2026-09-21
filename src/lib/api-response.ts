import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export function apiSuccess<T>(data: T, status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return NextResponse.json(payload, { status });
}

export function apiError(
  message: string,
  code = 'INTERNAL_ERROR',
  status = 500,
  details?: unknown
) {
  // In production, never leak raw internal stack or database error details
  const isProd = process.env.NODE_ENV === 'production';
  const sanitizedDetails = isProd && status >= 500 ? undefined : details;

  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(sanitizedDetails ? { details: sanitizedDetails } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  return NextResponse.json(payload, { status });
}

export function apiNotFound(message = 'Resource not found') {
  return apiError(message, 'NOT_FOUND', 404);
}

export function apiBadRequest(message: string, details?: unknown) {
  return apiError(message, 'BAD_REQUEST', 400, details);
}

export function apiUnauthorized(message = 'Unauthorized') {
  return apiError(message, 'UNAUTHORIZED', 401);
}

export function apiForbidden(message = 'Forbidden') {
  return apiError(message, 'FORBIDDEN', 403);
}

export function apiTooManyRequests(message = 'Too many requests. Please try again later.') {
  return apiError(message, 'RATE_LIMIT_EXCEEDED', 429);
}
