import { NextResponse } from "next/server";

export function handleApiError(
  error: unknown,
  fallbackMessage = "Internal server error.",
  status = 500
) {
  console.error(error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : fallbackMessage,
    },
    { status }
  );
}