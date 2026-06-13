import validator from "validator";
import xss from "xss";

const VALID_TASK_STATUS = [
  "todo",
  "in_progress",
  "done",
];

function sanitizeText(value = "") {
  return xss(String(value).trim());
}

function createValidationError(
  field,
  message,
  code = "VALIDATION_ERROR"
) {
  return {
    success: false,
    error: {
      code,
      field,
      message,
      timestamp: Date.now(),
    },
  };
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
    !validator.isLength(
      title.trim(),
      {
        min: 1,
        max: 120,
      }
    )
  ) {
    return res.status(400).json(
      createValidationError(
        "title",
        "Task title must be between 1 and 120 characters"
      )
    );
  }

  if (
    description &&
    !validator.isLength(
      description.trim(),
      { max: 1000 }
    )
  ) {
    return res.status(400).json(
      createValidationError(
        "description",
        "Description too long"
      )
    );
  }

  if (
    !validateTaskStatus(
      status
    )
  ) {
    return res.status(400).json(
      createValidationError(
        "status",
        "Invalid task status"
      )
    );
  }

  if (
    !validateTaskPosition(
      position
    )
  ) {
    return res.status(400).json(
      createValidationError(
        "position",
        "Invalid task position"
      )
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
    !validator.isLength(
      username.trim(),
      {
        min: 2,
        max: 40,
      }
    )
  ) {
    return res.status(400).json(
      createValidationError(
        "username",
        "Invalid username length"
      )
    );
  }

  if (
    text &&
    !validator.isLength(
      text.trim(),
      { max: 2000 }
    )
  ) {
    return res.status(400).json(
      createValidationError(
        "text",
        "Message too long"
      )
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
    !validator.isLength(
      title.trim(),
      {
        min: 1,
        max: 120,
      }
    )
  ) {
    return res.status(400).json(
      createValidationError(
        "title",
        "Invalid title"
      )
    );
  }

  if (
    !body ||
    !validator.isLength(
      body.trim(),
      {
        min: 1,
        max: 1500,
      }
    )
  ) {
    return res.status(400).json(
      createValidationError(
        "body",
        "Invalid body"
      )
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
    return res.status(400).json(
      createValidationError(
        "type",
        "Invalid feed type"
      )
    );
  }

  req.body.title =
    sanitizeText(title);

  req.body.body =
    sanitizeText(body);

  next();
}