import supabase from "../config/db.js";
import { validateMessagePayload } from "../utils/messageValidation.js";

export const getMessages = async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase error in getMessages:", error);
    return res.status(500).json({ error: "Failed to retrieve messages." });
  }

  res.json(data);
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;

    // Derive username from the authenticated session instead of trusting the
    // request body. The route requires authenticateUser, so req.user is always
    // set at this point. Accepting username from the body allowed any
    // authenticated caller to impersonate a different user by supplying an
    // arbitrary username value.
    const username = req.user?.user_metadata?.username
      || req.user?.user_metadata?.name
      || req.user?.email
      || "Anonymous";

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

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          text,
          username,
          image,
          audio,
          status: "sent",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error in sendMessage:", error);
      return res.status(500).json({ error: "Failed to send message." });
    }
    const io = req.app.get("io");

    io.emit("newMessage", data[0]);


    res.json(data);
  } catch (err) {
    console.error("Server crash:", err);
    res.status(500).json({ error: "Server error" });
  }
};