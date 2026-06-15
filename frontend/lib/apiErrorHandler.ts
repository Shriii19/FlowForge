import { NextResponse } from "next/server";

export type ApiErrorContext = {
  operation?: string;
  module?: string;
  requestId?: string;
};

export type ApiErrorOptions = {
  fallbackMessage?: string;
  status?: number;
  exposeError?: boolean;
  context?: ApiErrorContext;
};

export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status = 500
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const DEFAULT_MESSAGE =
  "Internal server error.";

function buildErrorPayload(
  error: unknown,
  options: ApiErrorOptions
) {
  const {
    fallbackMessage = DEFAULT_MESSAGE,
    exposeError = true,
    context,
  } = options;

  const errorMessage =
    error instanceof Error
      ? error.message
      : fallbackMessage;

  return {
    error: exposeError
      ? errorMessage
      : fallbackMessage,
    timestamp:
      new Date().toISOString(),
    context,
  };
}

function resolveStatusCode(
  error: unknown,
  defaultStatus: number
) {
  if (
    error instanceof ApiError
  ) {
    return error.status;
  }

  return defaultStatus;
}

function logApiError(
  error: unknown,
  context?: ApiErrorContext
) {
  console.error({
    timestamp:
      new Date().toISOString(),
    error,
    context,
  });
}

export function handleApiError(
  error: unknown,
  options: ApiErrorOptions = {}
) {
  const {
    status = 500,
    context,
  } = options;

  logApiError(
    error,
    context
  );

  const payload =
    buildErrorPayload(
      error,
      options
    );

  const resolvedStatus =
    resolveStatusCode(
      error,
      status
    );

  return NextResponse.json(
    payload,
    {
      status:
        resolvedStatus,
    }
  );
}

export function createApiError(
  message: string,
  status = 500
) {
  return new ApiError(
    message,
    status
  );
}