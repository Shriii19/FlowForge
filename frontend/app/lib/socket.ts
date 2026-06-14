import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export function getSocket(): Socket {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log(
      `[Socket] Connected (${socket?.id})`
    );
  });

  socket.on("disconnect", (reason) => {
    console.warn(
      `[Socket] Disconnected: ${reason}`
    );

    if (reason === "io server disconnect") {
      socket?.connect();
    }
  });

  socket.on("reconnect", (attempt) => {
    console.log(
      `[Socket] Reconnected after ${attempt} attempt(s)`
    );
  });

  socket.on("reconnect_attempt", (attempt) => {
    console.log(
      `[Socket] Reconnect attempt ${attempt}`
    );
  });

  socket.on("reconnect_error", (error) => {
    console.error(
      "[Socket] Reconnection failed:",
      error
    );
  });

  socket.on("connect_error", (error) => {
    console.error(
      "[Socket] Connection error:",
      error
    );
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}