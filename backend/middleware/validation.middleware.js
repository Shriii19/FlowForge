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
    return res.status(400).json({
      error:
        "Task title must be between 1 and 120 characters",
    });
  }

  if (
    description &&
    !validator.isLength(
      description.trim(),
      { max: 1000 }
    )
  ) {
    return res.status(400).json({
      error:
        "Description too long",
    });
  }

  if (
    !validateTaskStatus(
      status
    )
  ) {
    return res.status(400).json({
      error:
        "Invalid task status",
    });
  }

  if (
    !validateTaskPosition(
      position
    )
  ) {
    return res.status(400).json({
      error:
        "Invalid task position",
    });
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
    return res.status(400).json({
      error:
        "Invalid username length",
    });
  }

  if (
    text &&
    !validator.isLength(
      text.trim(),
      { max: 2000 }
    )
  ) {
    return res.status(400).json({
      error:
        "Message too long",
    });
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
    return res.status(400).json({
      error: "Invalid title",
    });
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
    return res.status(400).json({
      error: "Invalid body",
    });
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
    return res.status(400).json({
      error:
        "Invalid feed type",
    });
  }

  req.body.title =
    sanitizeText(title);

  req.body.body =
    sanitizeText(body);

  next();
}