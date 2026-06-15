import validator from "validator";
import xss from "xss";

const VALID_TASK_STATUS = [
  "todo",
  "in_progress",
  "done",
];

const VALIDATION_VERSION = 1;

const validationMetrics = {
  validationAttempts: 0,
  validationFailures: 0,
  normalizedInputs: 0,
};

const MAX_USERNAME_LENGTH = 40;
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;

function sanitizeText(value = "") {
  return xss(String(value).trim());
}

function normalizeInputValue(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  validationMetrics.normalizedInputs += 1;

  return String(value).trim();
}

function validateRequiredField(
  value
) {
  return (
    normalizeInputValue(value)
      .length > 0
  );
}

function recordValidationAttempt() {
  validationMetrics.validationAttempts += 1;
}

function recordValidationFailure() {
  validationMetrics.validationFailures += 1;
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
  recordValidationFailure();

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

  recordValidationAttempt();

  if (
    !req.body ||
    typeof req.body !== "object"
  ) {
    return sendValidationFailure(
      res,
      "request",
      "Invalid request payload"
    );
  }

  if (
    !validateRequiredField(
      title
    ) ||
    !validateLengthRule(
      normalizeInputValue(title),
      1,
      MAX_TITLE_LENGTH
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
      normalizeInputValue(
        description
      ),
      0,
      MAX_DESCRIPTION_LENGTH
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

  recordValidationAttempt();

  if (
    !req.body ||
    typeof req.body !== "object"
  ) {
    return sendValidationFailure(
      res,
      "request",
      "Invalid request payload"
    );
  }

  if (
    username &&
    !validateLengthRule(
      normalizeInputValue(
        username
      ),
      2,
      MAX_USERNAME_LENGTH
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

  recordValidationAttempt();

  if (
    !req.body ||
    typeof req.body !== "object"
  ) {
    return sendValidationFailure(
      res,
      "request",
      "Invalid request payload"
    );
  }

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
    validationAttempts:
      validationMetrics.validationAttempts,
    validationFailures:
      validationMetrics.validationFailures,
    normalizedInputs:
      validationMetrics.normalizedInputs,
    timestamp:
      Date.now(),
  };
}