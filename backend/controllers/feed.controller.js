import { randomUUID } from "crypto";
import supabase from "../config/db.js";

const manualItems = [];

function toRelativeTime(value) {
  if (!value) return "Just now";
  const createdAt = new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  return new Date(value).toLocaleDateString("en", { month: "short", day: "numeric" });
}

function groupForDate(value) {
  if (!value) return "Today";
  const itemDate = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (itemDate.toDateString() === today.toDateString()) return "Today";
  if (itemDate.toDateString() === yesterday.toDateString()) return "Yesterday";
  return "Earlier";
}

function taskToFeedItem(task) {
  const isDone = task.status === "done";
  return {
    id: `task-${task.id}`,
    type: isDone ? "milestone" : "code",
    actor: isDone ? "System" : "FlowForge",
    action: isDone ? "completed a task" : "updated a task",
    title: task.title || "Untitled task",
    body: task.description || `Status changed to ${String(task.status || "todo").replace("_", " ")}.`,
    time: toRelativeTime(task.created_at),
    group: groupForDate(task.created_at),
    meta: isDone ? "Task completed" : "Task activity",
    image: null,
    progress: isDone ? 100 : task.status === "in_progress" ? 65 : 20,
  };
}

function messageToFeedItem(message) {
  return {
    id: `message-${message.id}`,
    type: "discussion",
    actor: message.username || "Team member",
    action: "shared an update",
    title: "Team discussion",
    body: message.text || "Shared an attachment.",
    time: toRelativeTime(message.created_at),
    group: groupForDate(message.created_at),
    meta: "Chat activity",
    image: "https://i.pravatar.cc/96?u=" + encodeURIComponent(message.username || message.id),
    progress: null,
  };
}

export const getFeedItems = async (req, res) => {
  try {
    const [{ data: tasks, error: tasksError }, { data: messages, error: messagesError }] =
      await Promise.all([
        supabase.from("tasks").select("id,title,description,status,created_at").order("created_at", { ascending: false }).limit(12),
        supabase.from("messages").select("id,username,text,created_at").order("created_at", { ascending: false }).limit(12),
      ]);

    if (tasksError) throw tasksError;
    if (messagesError) throw messagesError;

    const items = [
      ...manualItems,
      ...(tasks || []).map(taskToFeedItem),
      ...(messages || []).map(messageToFeedItem),
    ].sort((a, b) => String(b.id).localeCompare(String(a.id)));

    res.status(200).json({ items });
  } catch (error) {
    console.error("Error loading feed:", error);
    res.status(500).json({ error: "Failed to load activity feed" });
  }
};

export const createFeedItem = async (req, res) => {
  const { title, body, type = "discussion" } = req.body || {};

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required" });
  }

  const item = {
    id: `manual-${randomUUID()}`,
    type,
    actor: "You",
    action: "created an insight",
    title,
    body,
    time: "Just now",
    group: "Today",
    meta: "Manual insight",
    image: null,
    progress: null,
  };

  manualItems.unshift(item);
  req.app.get("io")?.emit("feed-created", item);
  res.status(201).json({ item });
};
