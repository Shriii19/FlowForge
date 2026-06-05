export function validateMessagePayload({
  text,
  image,
  audio,
}) {
  if (!text && !image && !audio) {
    return "Message content required";
  }

  if (text && typeof text !== "string") {
    return "Invalid message format";
  }

  if (text && text.length > 1000) {
    return "Message exceeds maximum length";
  }

  return null;
}