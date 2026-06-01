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

// Restrict Socket.IO to the known frontend origin.
// origin: "*" allows any website to open a WebSocket connection, which
// lets third-party pages subscribe to real-time events or inject messages
// by abusing a visitor's active session. Reading the origin from the
// environment keeps the value configurable across deployments.
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

const DEFAULT_ROOM = "global-room";

const onlineUsers = new Map();

// In-memory reactions store, capped to prevent unbounded memory growth.
// Each unique messageId creates a new entry with no eviction. A user who
// sends many messages or reacts to many unique IDs would grow this object
// indefinitely, eventually exhausting process heap. Capping at 1000 entries
// and evicting the oldest key on overflow keeps memory bounded.
const MAX_REACTION_ENTRIES = 1000;
const reactionsStore = {};

app.use(cors());
app.use(apiLimiter);
// Tight body-size limit. Legitimate payloads for this API (task objects,
// chat messages) are a few kilobytes at most. 50 mb allowed a single
// request to force the server to allocate and parse 50 MB of JSON before
// any route handler ran, enabling memory exhaustion with very few requests.
app.use(express.json({ limit: "512kb" }));
app.use(express.urlencoded({ limit: "512kb", extended: true }));

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

  // JOIN ROOM
  socket.on("join", ({ username, room }) => {
    const activeRoom = room || DEFAULT_ROOM;

    socket.join(activeRoom);

    onlineUsers.set(socket.id, {
      username,
      room: activeRoom,
    });

    const roomUsers = Array.from(onlineUsers.values())
      .filter((user) => user.room === activeRoom)
      .map((user) => user.username);

    io.to(activeRoom).emit("onlineUsers", roomUsers);
  });

  // REACTIONS
  socket.on("react", ({ messageId, emoji, username }) => {
    // Evict the oldest tracked message when the cap is reached and this
    // messageId has not been seen before, keeping the store bounded.
    if (!reactionsStore[messageId] && Object.keys(reactionsStore).length >= MAX_REACTION_ENTRIES) {
      const oldestKey = Object.keys(reactionsStore)[0];
      delete reactionsStore[oldestKey];
    }

    if (!reactionsStore[messageId]) {
      reactionsStore[messageId] = {};
    }

    if (!reactionsStore[messageId][emoji]) {
      reactionsStore[messageId][emoji] = new Set();
    }

    const users = reactionsStore[messageId][emoji];

    // toggle reaction
    if (users.has(username)) {
      users.delete(username);
    } else {
      users.add(username);
    }

    // convert Set -> count
    const formatted = {};

    for (const emo in reactionsStore[messageId]) {
      formatted[emo] = reactionsStore[messageId][emo].size;
    }

    const userData = onlineUsers.get(socket.id);

    if (userData?.room) {
      io.to(userData.room).emit("reactionUpdate", {
        messageId,
        reactions: formatted,
      });
    }
  });

  // TASK MOVEMENT
  socket.on("task-moved", ({ room, task }) => {
    if (!room) return;

    console.log("Task moved:", task);

    io.to(room).emit("task-moved", task);
  });

  // MESSAGE SEEN
  socket.on("seen", ({ messageId, room }) => {
    const userData = onlineUsers.get(socket.id);

    if (room) {
      io.to(room).emit("messageSeen", messageId);
    }
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    const disconnectedUser = onlineUsers.get(socket.id);

    onlineUsers.delete(socket.id);

    if (disconnectedUser?.room) {
      const roomUsers = Array.from(onlineUsers.values())
        .filter((user) => user.room === disconnectedUser.room)
        .map((user) => user.username);

      io.to(disconnectedUser.room).emit("onlineUsers", roomUsers);
    }

    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});