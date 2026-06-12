import sanitizeHtml from "sanitize-html";

const MAX_INPUT_LENGTH = 10000;

function normalizeInput(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n");
}

function normalizeWhitespace(input: string): string {
  return input
    .replace(/\s+/g, " ")
    .trim();
}

function enforceLengthLimit(input: string): string {
  return input.length > MAX_INPUT_LENGTH
    ? input.slice(0, MAX_INPUT_LENGTH)
    : input;
}

export function sanitizeInput(
  input: string | null | undefined
): string {
  if (!input) {
    return "";
  }

  const normalizedInput =
    normalizeInput(input);

  const sanitized = sanitizeHtml(
    normalizedInput,
    {
      allowedTags: [],
      allowedAttributes: {},
      allowedSchemes: [],
      parser: {
        lowerCaseTags: true,
      },
    }
  );

  const cleanedInput =
    normalizeWhitespace(sanitized);

  return enforceLengthLimit(
    cleanedInput
  );
}