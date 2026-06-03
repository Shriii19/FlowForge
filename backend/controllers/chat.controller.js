import supabase from "../config/db.js";

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
    const { text, username, image, audio } = req.body;

    console.log("Incoming:", {
      text,
      username,
      image,
      audio,
    });

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

    if (!text && !image && !audio) {
      return res.status(400).json({
        error: "Message content required",
      });
    }

    if (text && typeof text !== "string") {
      return res.status(400).json({
        error: "Invalid message format",
      });
    }

    if (text && text.length > 1000) {
      return res.status(400).json({
        error: "Message exceeds maximum length",
      });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          text,
          username: user.email || username,
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