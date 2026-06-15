import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

type SocketEventMetadata = {
  sequence: number;
  receivedAt: number;
};

const eventBuffer: Array<{
  event: string;
  metadata: SocketEventMetadata;
}> = [];

let eventSequence = 0;

function buildEventMetadata(): SocketEventMetadata {
  eventSequence += 1;

  return {
    sequence: eventSequence,
    receivedAt: Date.now(),
  };
}

function enqueueBufferedEvent(
  event: string
) {
  eventBuffer.push({
    event,
    metadata: buildEventMetadata(),
  });

  if (eventBuffer.length > 100) {
    eventBuffer.shift();
  }
}

function getLatestSequence() {
  return eventSequence;
}

function clearBufferedEvents() {
  eventBuffer.length = 0;
}

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "http://localhost:5000";

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
    transports: [
      "websocket",
      "polling",
    ],
  });

  socket.on("connect", () => {
    enqueueBufferedEvent(
      "connect"
    );

    console.log(
      `[Socket] Connected (${socket?.id})`
    );

    console.log(
      `[Socket] Sequence ${getLatestSequence()}`
    );
  });

  socket.on(
    "disconnect",
    (reason) => {
      enqueueBufferedEvent(
        "disconnect"
      );

      console.warn(
        `[Socket] Disconnected: ${reason}`
      );

      if (
        reason ===
        "io server disconnect"
      ) {
        socket?.connect();
      }
    }
  );

  socket.on(
    "reconnect",
    (attempt) => {
      enqueueBufferedEvent(
        "reconnect"
      );

      console.log(
        `[Socket] Reconnected after ${attempt} attempt(s)`
      );
    }
  );

  socket.on(
    "reconnect_attempt",
    (attempt) => {
      enqueueBufferedEvent(
        "reconnect_attempt"
      );

      console.log(
        `[Socket] Reconnect attempt ${attempt}`
      );
    }
  );

  socket.on(
    "reconnect_error",
    (error) => {
      enqueueBufferedEvent(
        "reconnect_error"
      );

      console.error(
        "[Socket] Reconnection failed:",
        error
      );
    }
  );

  socket.on(
    "connect_error",
    (error) => {
      enqueueBufferedEvent(
        "connect_error"
      );

      console.error(
        "[Socket] Connection error:",
        error
      );
    }
  );

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();

    socket.disconnect();

    clearBufferedEvents();

    socket = null;
  }
}