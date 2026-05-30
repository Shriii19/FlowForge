import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import chatRoutes from "./routes/chat.routes.js";
import taskRoutes from "./routes/tasks.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import insightsRoutes from "./routes/insights.routes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.set("io", io);

const onlineUsers = new Map(); // socket.id -> username

// store reactions in memory
const reactionsStore = {};

app.use(cors());
app.use(apiLimiter);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  res.send("FlowForge Backend Running 🚀");
});

app.use("/api/chat", chatRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/insights", insightsRoutes);

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // JOIN
  socket.on("join", (username) => {
    onlineUsers.set(socket.id, username);
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  });

  // typing
  socket.on("react", ({ messageId, emoji, username }) => {
  if (!reactionsStore[messageId]) {
    reactionsStore[messageId] = {};
  }

  if (!reactionsStore[messageId][emoji]) {
    reactionsStore[messageId][emoji] = new Set();
  }

  const users = reactionsStore[messageId][emoji];

  //  toggle
  if (users.has(username)) {
    users.delete(username); 
  } else {
    users.add(username); 
  }

  // convert Set ->count
  const formatted = {};
  for (const emo in reactionsStore[messageId]) {
    formatted[emo] = reactionsStore[messageId][emo].size;
  }

  io.emit("reactionUpdate", {
    messageId,
    reactions: formatted,
  });
});
socket.on("task-moved", (task) => {
    console.log("Task moved:", task);
    io.emit("task-moved", task);
  });
  // seen
  socket.on("seen", (messageId) => {
    io.emit("messageSeen", messageId);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
