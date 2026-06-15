import sanitizeHtml from "sanitize-html";

const MAX_INPUT_LENGTH = 10000;
const MAX_LINE_COUNT = 500;

type ValidationResult = {
  isValid: boolean;
  reason?: string;
};

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

function removeControlCharacters(
  input: string
): string {
  return input.replace(
    /[\u0001-\u001F\u007F]/g,
    ""
  );
}

function removeSuspiciousUnicode(
  input: string
): string {
  return input.replace(
    /[\u202A-\u202E\u2066-\u2069]/g,
    ""
  );
}

function limitLineCount(
  input: string
): string {
  const lines =
    input.split("\n");

  return lines
    .slice(0, MAX_LINE_COUNT)
    .join("\n");
}

export function validateInput(
  input: string
): ValidationResult {
  if (
    input.length >
    MAX_INPUT_LENGTH * 2
  ) {
    return {
      isValid: false,
      reason:
        "Input exceeds validation threshold",
    };
  }

  return {
    isValid: true,
  };
}

export function securityAuditInput(
  input: string
) {
  return {
    containsScript:
      /<script/i.test(input),
    containsEventHandlers:
      /on\w+=/i.test(input),
    containsJavascriptUrl:
      /javascript:/i.test(input),
    inputLength:
      input.length,
  };
}

export function sanitizeInput(
  input: string | null | undefined
): string {
  if (!input) {
    return "";
  }

  const validation =
    validateInput(input);

  if (!validation.isValid) {
    return "";
  }

  const normalizedInput =
    normalizeInput(input);

  const controlSafe =
    removeControlCharacters(
      normalizedInput
    );

  const unicodeSafe =
    removeSuspiciousUnicode(
      controlSafe
    );

  const sanitized =
    sanitizeHtml(
      unicodeSafe,
      {
        allowedTags: [],
        allowedAttributes: {},
        allowedSchemes: [],
        parser: {
          lowerCaseTags: true,
        },
      }
    );

  const normalizedWhitespace =
    normalizeWhitespace(
      sanitized
    );

  const lineLimited =
    limitLineCount(
      normalizedWhitespace
    );

  return enforceLengthLimit(
    lineLimited
  );
}