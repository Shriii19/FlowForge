import supabase from "../config/db.js";

const memberProfiles = [
  { id: "alex", name: "Alex Rivera", role: "Lead Frontend Engineer", focus: "Frontend", image: "https://i.pravatar.cc/96?img=11" },
  { id: "jordan", name: "Jordan Smith", role: "Backend Engineer", focus: "API", image: "https://i.pravatar.cc/96?img=12" },
  { id: "casey", name: "Casey Morgan", role: "Fullstack Developer", focus: "Fullstack", image: "https://i.pravatar.cc/96?img=13" },
  { id: "riley", name: "Riley Lee", role: "QA Analyst", focus: "QA", image: "https://i.pravatar.cc/96?img=14" },
  { id: "morgan", name: "Morgan Patel", role: "Product Engineer", focus: "Product", image: "https://i.pravatar.cc/96?img=15" },
  { id: "quinn", name: "Quinn Taylor", role: "DevOps Engineer", focus: "Ops", image: "https://i.pravatar.cc/96?img=16" },
];

function hashString(value) {
  return String(value || "")
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
}

function buildMembers(tasks = [], messages = [], sprintOffset = 0) {
  return memberProfiles.map((profile, index) => {
    const assignedTasks = tasks.filter((task, taskIndex) => {
      const seed = hashString(task.id || task.title || taskIndex);
      return seed % memberProfiles.length === index;
    });
    const completedTasks = assignedTasks.filter((task) => task.status === "done");
    const messageCount = messages.filter((message) => {
      const seed = hashString(message.username || message.id);
      return seed % memberProfiles.length === index;
    }).length;

    const assigned = Math.min(98, Math.max(35, assignedTasks.length * 12 + 48 - sprintOffset * 6));
    const completed = Math.min(assigned, Math.max(20, completedTasks.length * 18 + messageCount * 4 + 34 - sprintOffset * 5));
    const reviews = Math.max(6, messageCount * 2 + completedTasks.length + 8 - sprintOffset);
    const activity = Array.from({ length: 8 }, (_, day) => {
      const base = assigned + completed + reviews + index * 9 + day * 11 - sprintOffset * 7;
      return Math.min(100, Math.max(18, base % 100));
    });

    return {
      ...profile,
      assigned,
      completed,
      reviews,
      activity,
    };
  });
}

export const getAnalytics = async (req, res) => {
  try {
    const [{ data: tasks, error: tasksError }, { data: messages, error: messagesError }] =
      await Promise.all([
        supabase.from("tasks").select("id,title,status,position,created_at"),
        supabase.from("messages").select("id,username,text,created_at"),
      ]);

    if (tasksError) throw tasksError;
    if (messagesError) throw messagesError;

    res.status(200).json({
      sprints: [
        { label: "Sprint 42", members: buildMembers(tasks || [], messages || [], 0) },
        { label: "Sprint 41", members: buildMembers(tasks || [], messages || [], 1) },
      ],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error building analytics:", error);
    res.status(500).json({ error: "Failed to load analytics" });
  }
};
