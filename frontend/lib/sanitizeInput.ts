import sanitizeHtml from "sanitize-html";

export function sanitizeInput(input: string) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}