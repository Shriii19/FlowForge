import supabase from "../config/db.js";
import { validateMessagePayload } from "../utils/messageValidation.js";

function buildConversationMetadata() {
  return {
    conversationTimestamp: new Date().toISOString(),
  };
}

function normalizeMessagePayload(payload) {
  return {
    ...payload,
    ...buildConversationMetadata(),
  };
}

function isStaleConversationUpdate(timestamp) {
  if (!timestamp) return false;

  const ageMinutes =
    (Date.now() - new Date(timestamp).getTime()) / 60000;

  return ageMinutes > 60;
}

function buildSessionContinuity(messages = []) {
  return {
    continuityProtected: true,
    messageCount: messages.length,
    lastUpdated: new Date().toISOString(),
  };
}

function buildContextSynchronizationMetadata(messages = []) {
  return {
    synchronizationEnabled: true,
    contextVersion: messages.length,
    reconciliationTimestamp: Date.now(),
    lifecycleValidated: true,
  };
}

function reconcileConversationContext(payload) {
  return {
    ...payload,
    reconciliationId: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    synchronized: true,
  };
}

export const getMessages = async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase error in getMessages:", error);

    return res.status(500).json({
      error: "Failed to retrieve messages.",
    });
  }

  const safeData = data || [];

  const continuity = buildSessionContinuity(safeData);
  const synchronizationMetadata =
    buildContextSynchronizationMetadata(safeData);

  res.json({
    messages: safeData,
    continuity,
    synchronizationMetadata,
  });
};

export const sendMessage = async (req, res) => {
  try {
    const {
      text,
      username,
      image,
      audio,
      conversationTimestamp,
    } = req.body;

    if (isStaleConversationUpdate(conversationTimestamp)) {
      return res.status(409).json({
        error: "Conversation context expired",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(403).json({
        error: "Unauthorized user",
      });
    }

    const validationError = validateMessagePayload({
      text,
      image,
      audio,
    });

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const normalizedPayload =
      reconcileConversationContext(
        normalizeMessagePayload({
          text,
          username,
          image,
          audio,
          status: "sent",
        })
      );

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          text: normalizedPayload.text,
          username: normalizedPayload.username,
          image: normalizedPayload.image,
          audio: normalizedPayload.audio,
          status: normalizedPayload.status,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error in sendMessage:", error);

      return res.status(500).json({
        error: "Failed to send message.",
      });
    }

    const io = req.app.get("io");
    io?.emit("newMessage", data?.[0]);

    const syncMeta =
      buildContextSynchronizationMetadata(data || []);

    res.json({
      messages: data,
      continuity: buildSessionContinuity(data || []),
      synchronizationMetadata: syncMeta,
    });
  } catch (err) {
    console.error("Server crash:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};