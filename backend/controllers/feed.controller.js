import { randomUUID } from "crypto";
import supabase from "../config/db.js";

const manualItems = [];

function calculateEngagementScore(
  item
) {
  let score = 0;

  if (item.type === "milestone") {
    score += 50;
  }

  if (item.type === "code") {
    score += 30;
  }

  if (item.type === "discussion") {
    score += 20;
  }

  if (item.progress) {
    score += item.progress;
  }

  return score;
}

function calculateRecencyScore(
  createdAt
) {
  const ageHours =
    Math.max(
      1,
      (Date.now() -
        new Date(
          createdAt
        ).getTime()) /
        3600000
    );

  return Math.max(
    1,
    Math.round(100 / ageHours)
  );
}

function buildRankingMetadata(
  item
) {
  const engagement =
    calculateEngagementScore(
      item
    );

  const recency =
    calculateRecencyScore(
      item.createdAt
    );

  return {
    ...item,
    rankingScore:
      engagement + recency,
    rankingFactors: {
      engagement,
      recency,
    },
  };
}


function toRelativeTime(value) {
  if (!value) return "Just now";

  const createdAt = new Date(value).getTime();
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - createdAt) / 60000)
  );

  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) return `${diffHours} hours ago`;

  return new Date(value).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

function groupForDate(value) {
  if (!value) return "Today";

  const itemDate = new Date(value);

  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (itemDate.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (itemDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return "Earlier";
}

function normalizeFeedItem({
  id,
  type,
  actor,
  action,
  title,
  body,
  createdAt,
  meta,
  image = null,
  progress = null,
}) {
  return {
    id,
    type,
    actor,
    action,
    title,
    body,
    time: toRelativeTime(createdAt),
    group: groupForDate(createdAt),
    meta,
    image,
    progress,
    createdAt,
  };
}

function taskToFeedItem(task) {
  const isDone = task.status === "done";

  return normalizeFeedItem({
    id: `task-${task.id}`,
    type: isDone ? "milestone" : "code",
    actor: isDone ? "System" : "FlowForge",
    action: isDone ? "completed a task" : "updated a task",
    title: task.title || "Untitled task",
    body:
      task.description ||
      `Status changed to ${String(
        task.status || "todo"
      ).replace("_", " ")}.`,
    createdAt: task.created_at,
    meta: isDone ? "Task completed" : "Task activity",
    progress:
      isDone
        ? 100
        : task.status === "in_progress"
        ? 65
        : 20,
  });
}

function messageToFeedItem(message) {
  return normalizeFeedItem({
    id: `message-${message.id}`,
    type: "discussion",
    actor: message.username || "Team member",
    action: "shared an update",
    title: "Team discussion",
    body: message.text || "Shared an attachment.",
    createdAt: message.created_at,
    meta: "Chat activity",
    image:
      "https://i.pravatar.cc/96?u=" +
      encodeURIComponent(
        message.username || message.id
      ),
  });
}

function buildFeedItems(tasks = [], messages = []) {
  return [
    ...manualItems,
    ...(tasks || []).map(taskToFeedItem),
    ...(messages || []).map(messageToFeedItem),
  ];
}

function sortFeedItems(items = []) {
  return items
    .map(
      buildRankingMetadata
    )
    .sort((a, b) => {
      if (
        b.rankingScore !==
        a.rankingScore
      ) {
        return (
          b.rankingScore -
          a.rankingScore
        );
      }

      const aTime =
        Date.parse(
          a.createdAt || ""
        ) || 0;

      const bTime =
        Date.parse(
          b.createdAt || ""
        ) || 0;

      return bTime - aTime;
    });
}

export const getFeedItems = async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const offset = (page - 1) * limit;

  try {
    const [
      { data: tasks, error: tasksError },
      { data: messages, error: messagesError },
    ] = await Promise.all([
      supabase
        .from("tasks")
        .select(
          "id,title,description,status,created_at"
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(50),

      supabase
        .from("messages")
        .select(
          "id,username,text,created_at"
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(50),
    ]);

    if (tasksError) throw tasksError;
    if (messagesError) throw messagesError;

    const aggregatedItems =
      sortFeedItems(
        buildFeedItems(
          tasks,
          messages
        )
      );

    const feedMetadata =
      buildFeedMetadata(
        aggregatedItems
      );

    const items = aggregatedItems.slice(
      offset,
      offset + limit
    );

    res.status(200).json({
      metadata:
        feedMetadata,
      items,
      pagination: {
        page,
        limit,
        total: aggregatedItems.length,
        hasMore:
          offset + limit <
          aggregatedItems.length,
      },
    });
  } catch (error) {
    console.error(
      "Error loading feed:",
      error
    );

    res.status(500).json({
      error: "Failed to load activity feed",
    });
  }
};

export const createFeedItem = async (
  req,
  res
) => {
  const {
    title,
    body,
    type = "discussion",
  } = req.body || {};

  if (!title || !body) {
    return res.status(400).json({
      error: "Title and body are required",
    });
  }

  const item = normalizeFeedItem({
    id: `manual-${randomUUID()}`,
    type,
    actor: "You",
    action: "created an insight",
    title,
    body,
    createdAt: new Date().toISOString(),
    meta: "Manual insight",
  });

  manualItems.unshift(item);

  req.app
    .get("io")
    ?.emit("feed-created", item);

  res.status(201).json({ item });
};