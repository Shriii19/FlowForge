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

    if ((!text && !image && !audio) || !username) {
      return res.status(400).json({error: "Message content & username required",});
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([{ text, username, image, audio, status: "sent" }])
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