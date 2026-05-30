"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { io, Socket } from "socket.io-client";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Smile, Paperclip, Mic, Square } from "lucide-react";
import { supabase } from "../lib/supabase";

type Message = {
  id?: string;
  user: string;
  text: string;
  time?: string;
  status?: string;
  image?: string;
  audio?: string;
  reactions?: { [emoji: string]: number };
  replyTo?: {
    user: string;
    text: string;
  };
  isPinned?: boolean;
};

type ChatMessageResponse = {
  id?: string;
  username: string;
  text: string;
  image?: string | null;
  audio?: string | null;
  created_at: string;
  status?: string | null;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const matchedMessageRef = useRef<HTMLDivElement | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);
  const [unreadCount, setUnreadCount] = useState(0);
  

  //  SOCKET SETUP
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    // FETCH MESSAGES
    fetch("http://localhost:5000/api/chat")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Invalid messages response:", data);
          return;
        }

        const formatted = data.map((msg: ChatMessageResponse) => ({
          id: msg.id,
          user: msg.username,
          text: msg.text,
          image: msg.image || undefined,
          audio: msg.audio || undefined,
          time: new Date(msg.created_at).toLocaleTimeString(),
          status: msg.status || "sent",
        }));
        setMessages(formatted);
        setLoading(false);
      });

// NEW MESSAGE
socket.on("newMessage", (msg) => {
  setMessages((prev) => {
    const alreadyExists = prev.some(
      (m) =>
        m.user === msg.username &&
        m.text === msg.text &&
        m.image === msg.image &&
        m.audio === msg.audio
    );

    if (alreadyExists) return prev;

    return [
      ...prev,
      {
        id: msg.id,
        user: msg.username,
        text: msg.text,
        image: msg.image || undefined,
        audio: msg.audio || undefined,
        time: new Date(msg.created_at).toLocaleTimeString(),
        status: msg.status,
      },
    ];
  });

  if (!isAtBottomRef.current) {
    setUnreadCount((prev) => prev + 1);
  }
});
    // TYPING
    socket.on("typing", (user) => {
      setTypingUser(user);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser("");
      }, 1500);
    });

    // ONLINE USERS
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // SEEN
    socket.on("messageSeen", (messageId) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "seen" } : msg
        )
      );
    });
    socket.on("reactionUpdate", ({ messageId, reactions }) => {
      setMessages((prev) =>
      prev.map((msg) =>
      msg.id === messageId ? { ...msg, reactions } : msg ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  //  JOIN USER
  useEffect(() => {
    if (socketRef.current && username.trim()) {
      socketRef.current.emit("join", {
        username,
        room: "project-alpha",
      });
    }
  }, [username]);

  //autofocus effect
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // SMART AUTO SCROLL (FIXED)
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // SEARCH AUTO SCROLL
  useEffect(() => {
    if (searchQuery && matchedMessageRef.current) {
      matchedMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [searchQuery]);

  // MARK ONLY LAST MESSAGE AS SEEN 
  useEffect(() => {
    if (!socketRef.current) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.id) {
      socketRef.current.emit("seen", {
        messageId: lastMsg.id,
        room: "project-alpha",
      });
    }
  }, [messages]);

  // SEND
  async function handleSend() {
    if ((!input.trim() && !selectedImage && !audioBlob) || !username.trim()) return;

    const currentImage = selectedImage;
    const currentAudio = audioBlob;

    const session = await supabase?.auth.getSession();

    const token = session?.data.session?.access_token;

    await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: input,
        username,
        image: currentImage,
        audio: currentAudio,
      }),
    });

    setInput("");
    setSelectedImage(null);
    setAudioBlob(null);
    setReplyingTo(null);

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }



function handleKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>
) {
  // Shift + Enter → new line
  if (e.key === "Enter" && e.shiftKey) {
    return;
  }

  // Enter → send message
  if (e.key === "Enter") {
    e.preventDefault();
    handleSend();
  }
}

  // TYPING
  function handleTyping(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);

    if (socketRef.current && username.trim()) {
      socketRef.current.emit("typing", username);
    }
  }
  //emoji select function
  function handleEmojiClick(emojiData: EmojiClickData) {
    setInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

      const reader = new FileReader();

      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };

      reader.readAsDataURL(file);
  }

  async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      const reader = new FileReader();

      reader.onloadend = () => {
        setAudioBlob(reader.result as string);
      };

      reader.readAsDataURL(blob);
    };

    mediaRecorder.start();

    setIsRecording(true);
  } catch (error) {
    console.error("Recording failed:", error);
  }
}
function stopRecording() {
  mediaRecorderRef.current?.stop();
  setIsRecording(false);
}

  function handleReact(messageId: string | undefined, emoji: string) {
    if (!messageId) return;

    // send reaction to server
    socketRef.current?.emit("react", {
      messageId,
      emoji,
      username,
      room: "project-alpha",
    });
  }
  function handleReply(msg: Message) {
    setReplyingTo(msg);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function handleDelete(messageId?: string) {
    setMessages((prev) =>
      prev.filter((msg) => msg.id !== messageId)
    );
  }

  function handlePin(messageId?: string) {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isPinned: !msg.isPinned }
          : msg
      )
    );
  }
  function handleEdit(messageId?: string, currentText?: string) {
    if (!messageId || !currentText) return;

    setEditingMessageId(messageId);
    setEditedText(currentText);

    // load message into input
    setInput(currentText);
}
    function clearSearch() {
      setSearchQuery("");
      setActiveMessageId(null);

      matchedMessageRef.current = null;
    }

const filteredMessages = messages.filter((msg) => {
  const query = searchQuery.toLowerCase();

  const matchesSearch =
    msg.text?.toLowerCase().includes(query) ||
    msg.user?.toLowerCase().includes(query) ||
    (query === "image" && msg.image) ||
    (query === "voice" && msg.audio);
  if (filterType === "image") {
    return matchesSearch && msg.image;
  }

  if (filterType === "voice") {
    return matchesSearch && msg.audio;
  }

  return matchesSearch;
});

  


return (
  <div className="mx-auto flex h-[calc(100vh-48px)] w-full max-w-6xl flex-col gap-4 overflow-hidden p-3 sm:p-6 md:p-10">

    {/* HEADER */}
    <div className="rounded-3xl border border-(--line) bg-white p-4 sm:p-6 shadow-sm">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
        Team Chat
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Collaborate and communicate with your team in real time.
      </p>
    </div>

    {/* USERNAME */}
    <input
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      placeholder="Enter name"
      className="w-full rounded-2xl border border-(--line) bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-400"
    />

    {/* ONLINE USERS */}
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <div className="h-2 w-2 rounded-full bg-green-500"></div>

      <span className="font-medium">Online:</span>

      <span>{onlineUsers.join(", ")}</span>
    </div>

    {/* SEARCH + FILTER */}
<div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">

  {/* SEARCH */}
  <div className="relative flex-1">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          clearSearch();
        }
     }}
      placeholder="Search messages or users..."
      className="w-full rounded-xl border border-(--line) px-4 py-2 pr-10 text-sm outline-none transition focus:border-slate-400"
  />

    {searchQuery && (
      <button
        onClick={clearSearch}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600"
      >
        ✕
      </button>
    )}
  </div>

  {/* FILTER BUTTONS */}
  <div className="flex gap-2">
    {["all", "image", "voice"].map((type) => (
      <button
        key={type}
        onClick={() => setFilterType(type)}
        className={`rounded-xl px-4 py-2 text-sm transition ${
          filterType === type
            ? "bg-teal-700 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </button>
    ))}
  </div>
</div>

{loading ? (
  <div className="h-[55vh] space-y-4 overflow-hidden rounded-3xl border border-(--line) bg-white p-4 shadow-sm sm:h-[65vh] sm:p-5">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className={`flex ${
          i % 2 === 0 ? "justify-start" : "justify-end"
        }`}
      >
        <div className="max-w-[220px] animate-pulse rounded-2xl bg-slate-200 p-4">
          <div className="mb-2 h-3 w-24 rounded bg-slate-300"></div>

          <div className="h-3 w-40 rounded bg-slate-300"></div>
        </div>
      </div>
    ))}
  </div>
) : (

  /* MESSAGES */
  <div
    ref={containerRef}
    onScroll={() => {
      const el = containerRef.current;
      if (!el) return;

      const threshold = 100;

      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

      isAtBottomRef.current = atBottom;

      if (atBottom) {
        setUnreadCount(0);
      }
    }}
    className="h-[55vh] overflow-y-auto rounded-3xl border border-(--line) bg-white p-4 shadow-sm sm:h-[65vh] sm:p-5"
  >
    {filteredMessages.map((msg, i) => {
      const prevMsg = filteredMessages[i - 1];
      const isSameUser = prevMsg && prevMsg.user === msg.user;
      const isMe = msg.user === username;

      return (
        <div
          key={i}
          ref={
            searchQuery &&
            msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
              ? matchedMessageRef
              : null
          }
          onMouseEnter={() => setActiveMessageId(msg.id || null)}
          onMouseLeave={() => setActiveMessageId(null)}
          onClick={() =>
            setActiveMessageId(
              activeMessageId === msg.id
                ? null
                : msg.id || null
            )
          }
          className={`group relative flex ${
            isMe ? "justify-end" : "justify-start"
          } ${isSameUser ? "mt-1" : "mt-4"}`}
        >
            <div
              className={`w-fit max-w-[85%] sm:max-w-[320px] rounded-2xl p-4 shadow-sm ${
                isMe
                  ? `bg-teal-700 text-white ${
                      isSameUser
                        ? "rounded-tr-md"
                        : "rounded-br-md"
                    }`
                  : `bg-slate-100 text-slate-800 ${
                      isSameUser
                        ? "rounded-tl-md"
                        : "rounded-bl-md"
                    }`
              }`}
            >
              {/* USERNAME */}
              {!isMe && !isSameUser && (
                <p className="mb-1 text-sm font-semibold">
                  {msg.user}
                </p>
              )}

              {/* REPLIED MESSAGE */}
              {msg.replyTo && (
                <div className="mb-2 rounded-xl border-l-4 border-teal-300 bg-black/10 px-3 py-2 text-xs">
                  <p className="font-semibold text-teal-200">
                    {msg.replyTo.user}
                  </p>

                <p className="truncate text-slate-200">
                  {msg.replyTo.text}
                </p>
              </div>
            )}

              {/* TEXT */}
              {msg.text && (
                <p className="break-words text-sm leading-relaxed">
                  {searchQuery &&
                    msg.text.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                <>
                  {msg.text
                    .split(new RegExp(`(${searchQuery})`, "gi"))
                    .map((part, index) =>
                      part.toLowerCase() === searchQuery.toLowerCase() ? (
                  <span
                    key={index}
                    className="rounded bg-yellow-300 px-1 text-black"
                  >
                    {part}
                  </span>
                    ) : (
                    part
                  )
              )}
            </>
          ) : (
            msg.text
        )}
      </p>
    )}

              {/* IMAGE */}
              {msg.image && (
                <img src={msg.image} alt="Shared image" className="mt-3 max-h-52 w-full max-w-full rounded-xl object-cover"/>
              )}

              {/* AUDIO */}
              {msg.audio && (
                <audio
                  controls
                  className="mt-3 max-w-full"
                >
                  <source
                    src={msg.audio}
                    type="audio/webm"
                  />
                </audio>
              )}


              {/* MESSAGE ACTIONS */}
            <div
              className={`
                mb-2 flex flex-wrap gap-2 text-xs transition-all duration-200
                ${
                  activeMessageId === msg.id
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }
              `}
            >

              <button
                onClick={() => handleReply(msg)}
                className="hover:underline"
              >
                Reply
              </button>

              <button
                onClick={() => handlePin(msg.id)}
                className="hover:underline"
              >
                {msg.isPinned ? "Unpin" : "Pin"}
              </button>

              {msg.text && (
                <>
                  <button
                    onClick={() => handleCopy(msg.text)}
                    className="hover:underline"
                  >
                    Copy
                  </button>

                  {isMe && (
                    <button
                      onClick={() => handleEdit(msg.id, msg.text)}
                      className="hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </>
              )}

              {isMe && (
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="text-red-300 hover:underline"
                >
                Delete
              </button>
            )}
          </div>

              {/* REACTIONS */}
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {["👍", "❤️", "😂"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() =>
                      handleReact(msg.id, emoji)
                    }
                    className="transition hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}

                {msg.reactions &&
                  Object.entries(msg.reactions)
                    .filter(([_, count]) => count > 0)
                    .map(([emoji, count]) => (
                      <span
                        key={emoji}
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          isMe
                            ? "bg-white text-black"
                            : "bg-gray-200"
                        }`}
                      >
                        {emoji} {count}
                      </span>
                    ))}
              </div>

              {/* TIME */}
              <p className="mt-2 text-right text-[11px] opacity-60">
                {msg.time}{" "}
                {msg.status === "seen" ? "✓✓" : "✓"}
              </p>
            </div>
          </div>
        );
      })}

      {filteredMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm font-medium text-slate-500">
            No matching messages found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Try a different search or filter.
          </p>
        </div>
      )}

      <div ref={bottomRef}></div>
    </div>
    )}

    {/* UNREAD MESSAGE */}
    {unreadCount > 0 && (
      <div className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2">
        <button
          onClick={() => {
            bottomRef.current?.scrollIntoView({
              behavior: "smooth",
            });

            setUnreadCount(0);
          }}
          className="rounded-full bg-blue-500 px-4 py-1 text-sm text-white shadow transition hover:bg-blue-600"
        >
          {unreadCount} New Message
          {unreadCount > 1 ? "s" : ""}
        </button>
      </div>
    )}

    {/* TYPING */}
    {typingUser && typingUser !== username && (
      <p className="text-sm italic text-slate-500">
        {typingUser} is typing...
      </p>
    )}

    {/* IMAGE PREVIEW */}
    {selectedImage && (
      <div className="rounded-2xl border border-(--line) bg-white p-3 shadow-sm">
        <img
          src={selectedImage}
          alt="Preview"
          className="max-h-40 rounded-xl object-cover"
        />
      </div>
    )}

    {/* RECORDING */}
    {isRecording && (
      <p className="animate-pulse text-sm font-medium text-red-500">
        Recording voice message...
      </p>
    )}

    {/* AUDIO PREVIEW */}
    {audioBlob && (
      <div className="rounded-2xl border border-(--line) bg-white p-4 shadow-sm">
        <audio controls className="w-full">
          <source
            src={audioBlob}
            type="audio/webm"
          />
        </audio>
      </div>
    )}

    {/* REPLY PREVIEW */}
    {replyingTo && (
      <div className="flex items-center justify-between rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm shadow-sm">
        <div>
          <p className="font-semibold text-teal-700">
            Replying to {replyingTo.user}
          </p>

          <p className="truncate text-slate-600">
            {replyingTo.text}
          </p>
        </div>

        <button
          onClick={() => setReplyingTo(null)}
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          Cancel
        </button>
      </div>
    )}

    {/* EDITING MESSAGE */}
    {editingMessageId && (
      <div className="flex items-center justify-between rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-700 shadow-sm">
        <span>
          Editing message...
        </span>

        <button
          onClick={() => {
            setEditingMessageId(null);
            setEditedText("");
            setInput("");
          }}
          className="font-medium hover:underline"
        >
          Cancel
        </button>
      </div>
    )}

    {/* INPUT SECTION */}
   <div className="relative mt-4 flex w-full shrink-0 items-center gap-2 sm:gap-3">

      {/* EMOJI */}
      <div className="relative">
        <button
          onClick={() =>
            setShowEmojiPicker((prev) => !prev)
          }
          className="flex h-full items-center rounded-2xl border border-(--line) bg-white px-4 shadow-sm transition hover:bg-slate-50"
        >
          <Smile
            size={20}
            className="text-slate-600"
          />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-14 left-0 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
            />
          </div>
        )}
      </div>

      {/* FILE UPLOAD */}
      <label className="flex cursor-pointer items-center rounded-2xl border border-(--line) bg-white px-4 shadow-sm transition hover:bg-slate-50">
        <Paperclip
          size={20}
          className="text-slate-600"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>

      {/* VOICE */}
      <button
        onClick={
          isRecording
            ? stopRecording
            : startRecording
        }
        className={`flex items-center rounded-2xl border border-(--line) bg-white px-4 shadow-sm transition hover:bg-slate-50 ${
          isRecording
            ? "text-red-500"
            : "text-slate-600"
        }`}
      >
        {isRecording ? (
          <Square size={20} />
        ) : (
          <Mic size={20} />
        )}
      </button>
      
      
      {/* MESSAGE INPUT */}
      <div className="flex-1">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder={
            editingMessageId
              ? "Edit your message..."
              : "Type message"
          }
          rows={1}
          className="min-w-[140px] w-full resize-none rounded-2xl border border-(--line) bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-400"
        />

        <p
          className={`mt-1 text-right text-xs ${
            input.length > 450
              ? "text-red-500"
              : "text-slate-400"
          }`}
        >
          {input.length} / 500
        </p>
      </div>

      {/* SEND BUTTON */}
      <button
        onClick={handleSend}
        className="rounded-2xl bg-teal-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-105 hover:bg-teal-800"
      >
        Send
      </button>
    </div>
  </div>
);
}
