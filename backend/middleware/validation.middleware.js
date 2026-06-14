import validator from "validator";
import xss from "xss";

const VALID_TASK_STATUS = [
  "todo",
  "in_progress",
  "done",
];

const VALIDATION_VERSION = 1;

function sanitizeText(value = "") {
  return xss(String(value).trim());
}

function buildValidationMetadata(
  field,
  code
) {
  return {
    version:
      VALIDATION_VERSION,
    field,
    code,
    generatedAt:
      new Date().toISOString(),
  };
}

function transformValidationError(
  field,
  message,
  code =
    "VALIDATION_ERROR"
) {
  return {
    success: false,
    error: {
      code,
      field,
      message,
      timestamp: Date.now(),
      metadata:
        buildValidationMetadata(
          field,
          code
        ),
    },
  };
}

function sendValidationFailure(
  res,
  field,
  message,
  code
) {
  return res.status(400).json(
    transformValidationError(
      field,
      message,
      code
    )
  );
}

function validateLengthRule(
  value,
  min,
  max
) {
  return validator.isLength(
    String(value || "").trim(),
    {
      min,
      max,
    }
  );
}

function createValidationError(
  field,
  message,
  code = "VALIDATION_ERROR"
) {
  return transformValidationError(
    field,
    message,
    code
  );
}

function validateTaskStatus(
  status
) {
  return (
    !status ||
    VALID_TASK_STATUS.includes(
      status
    )
  );
}

function validateTaskPosition(
  position
) {
  return (
    position === undefined ||
    (Number.isInteger(position) &&
      position >= 0)
  );
}

export function validateValidationSystem() {
  return {
    version:
      VALIDATION_VERSION,
    supportedEntities: [
      "task",
      "message",
      "feed",
    ],
    standardizedErrors:
      true,
  };
}

export function validateTask(
  req,
  res,
  next
) {
  const {
    title,
    description,
    status,
    position,
  } = req.body;

  if (
    !title ||
    !validateLengthRule(
      title,
      1,
      120
    )
  ) {
    return sendValidationFailure(
      res,
      "title",
      "Task title must be between 1 and 120 characters"
    );
  }

  if (
    description &&
    !validateLengthRule(
      description,
      0,
      1000
    )
  ) {
    return sendValidationFailure(
      res,
      "description",
      "Description too long"
    );
  }

  if (
    !validateTaskStatus(
      status
    )
  ) {
    return sendValidationFailure(
      res,
      "status",
      "Invalid task status"
    );
  }

  if (
    !validateTaskPosition(
      position
    )
  ) {
    return sendValidationFailure(
      res,
      "position",
      "Invalid task position"
    );
  }

  req.body.title =
    sanitizeText(title);

  req.body.description =
    sanitizeText(
      description || ""
    );

  next();
}

export function validateMessage(
  req,
  res,
  next
) {
  const {
    text,
    username,
  } = req.body;

  if (
    username &&
    !validateLengthRule(
      username,
      2,
      40
    )
  ) {
    return sendValidationFailure(
      res,
      "username",
      "Invalid username length"
    );
  }

  if (
    text &&
    !validateLengthRule(
      text,
      0,
      2000
    )
  ) {
    return sendValidationFailure(
      res,
      "text",
      "Message too long"
    );
  }

  req.body.username =
    sanitizeText(
      username || ""
    );

  req.body.text =
    sanitizeText(text || "");

  next();
}

export function validateFeedItem(
  req,
  res,
  next
) {
  const {
    title,
    body,
    type,
  } = req.body;

  if (
    !title ||
    !validateLengthRule(
      title,
      1,
      120
    )
  ) {
    return sendValidationFailure(
      res,
      "title",
      "Invalid title"
    );
  }

  if (
    !body ||
    !validateLengthRule(
      body,
      1,
      1500
    )
  ) {
    return sendValidationFailure(
      res,
      "body",
      "Invalid body"
    );
  }

  const allowedTypes = [
    "discussion",
    "code",
    "milestone",
  ];

  if (
    type &&
    !allowedTypes.includes(
      type
    )
  ) {
    return sendValidationFailure(
      res,
      "type",
      "Invalid feed type"
    );
  }

  req.body.title =
    sanitizeText(title);

  req.body.body =
    sanitizeText(body);

  next();
}

export function getValidationMetrics() {
  return {
    version:
      VALIDATION_VERSION,
    supportedStatuses:
      VALID_TASK_STATUS.length,
    timestamp:
      Date.now(),
  };
}