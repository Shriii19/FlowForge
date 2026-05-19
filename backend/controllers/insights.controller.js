import supabase from "../config/db.js";

const fallbackContributors = ["Alex Rivera", "Casey Morgan", "Jordan Smith", "Riley Lee"];

function relativeTime(value) {
  if (!value) return "Recently";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Recently";
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function statusLabel(status) {
  if (status === "in_progress") return "In Progress";
  if (status === "done") return "Done";
  return "Todo";
}

function buildHeatmap(tasks = [], messages = []) {
  const total = tasks.length + messages.length;
  return Array.from({ length: 365 }, (_, index) => {
    const value = (index * 7 + total * 3 + Math.floor(index / 13)) % 6;
    return value;
  });
}

function countByStatus(tasks = []) {
  return tasks.reduce(
    (acc, task) => {
      if (task.status === "done") acc.done += 1;
      else if (task.status === "in_progress") acc.in_progress += 1;
      else acc.todo += 1;
      return acc;
    },
    { todo: 0, in_progress: 0, review: 0, done: 0 }
  );
}

async function loadSourceData() {
  const [{ data: tasks, error: tasksError }, { data: messages, error: messagesError }] =
    await Promise.all([
      supabase.from("tasks").select("*"),
      supabase.from("messages").select("*"),
    ]);

  if (tasksError) throw tasksError;
  if (messagesError) throw messagesError;

  return {
    tasks: tasks || [],
    messages: messages || [],
  };
}

export const getOverviewInsights = async (req, res) => {
  try {
    const { tasks, messages } = await loadSourceData();
    const counts = countByStatus(tasks);
    const completed = counts.done;
    const active = counts.in_progress;
    const total = tasks.length;
    const velocity = total ? Number(((completed / total) * 100).toFixed(1)) : 0;
    const momentum = Math.min(100, Math.round(velocity + active * 4 + messages.length));

    const recentActivity = [
      ...tasks.slice(-4).map((task) => ({
        id: `task-${task.id}`,
        label: `${task.title || "Untitled task"} moved to ${statusLabel(task.status)}`,
        time: relativeTime(task.created_at),
      })),
      ...messages.slice(-3).map((message) => ({
        id: `message-${message.id}`,
        label: `${message.username || "Team member"} shared an update`,
        time: relativeTime(message.created_at),
      })),
    ].slice(-5).reverse();

    res.status(200).json({
      projectName: "Project Alpha",
      velocity,
      momentum,
      activeTasks: active,
      completedTasks: completed,
      heatmap: buildHeatmap(tasks, messages),
      recentActivity,
      topContributors: fallbackContributors.slice(0, Math.max(3, Math.min(4, messages.length || 3))),
    });
  } catch (error) {
    console.error("Error loading overview insights:", error);
    res.status(500).json({ error: "Failed to load overview insights" });
  }
};

export const getTaskInsights = async (req, res) => {
  try {
    const { tasks } = await loadSourceData();
    const counts = countByStatus(tasks);
    const total = Math.max(1, tasks.length);

    const stages = [
      { label: "Todo", value: Number((counts.todo * 1.2 + 1).toFixed(1)), active: counts.todo > 0 },
      { label: "In Progress", value: Number((counts.in_progress * 1.5 + 1).toFixed(1)), active: counts.in_progress > 0 },
      { label: "Review", value: Number((counts.review * 1.1 + 0.8).toFixed(1)), active: false },
      { label: "Total Cycle", value: Number(((tasks.length + counts.in_progress + counts.done) / total * 4).toFixed(1)), active: false },
    ];

    const flowNodes = [
      { label: "Todo", sub: "Queue", value: counts.todo, active: counts.todo >= counts.in_progress && counts.todo >= counts.done },
      { label: "In Progress", sub: "Active", value: counts.in_progress, active: counts.in_progress > 0 },
      { label: "Review", sub: "Verify", value: counts.review, active: false },
      { label: "Done", sub: "Archived", value: counts.done, active: counts.done > 0 && counts.done >= counts.in_progress },
    ];

    const history = tasks.slice(-12).reverse().map((task, index) => ({
      id: String(task.id || index),
      task: task.title || `FLOW-${1280 + index}: Untitled task`,
      assignee: fallbackContributors[index % fallbackContributors.length],
      avatar: `https://i.pravatar.cc/96?u=${encodeURIComponent(String(task.id || index))}`,
      state: statusLabel(task.status),
      time: task.created_at ? new Date(task.created_at).toLocaleString() : "Recently",
      trigger: task.status === "done" ? "Completion Event" : "System Trigger",
      transition: relativeTime(task.created_at),
    }));

    res.status(200).json({
      summary: {
        totalTasks: tasks.length,
        completedTasks: counts.done,
        activeTasks: counts.in_progress,
        completionRate: Math.round((counts.done / total) * 100),
      },
      stages,
      flowNodes,
      history,
    });
  } catch (error) {
    console.error("Error loading task insights:", error);
    res.status(500).json({ error: "Failed to load task insights" });
  }
};
