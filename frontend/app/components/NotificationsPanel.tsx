"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  href: string;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Task moved to Review",
    description: "Landing page redesign moved to review stage.",
    time: "2m ago",
    unread: true,
    href: "/projects",
  },
  {
    id: 2,
    title: "New chat message",
    description: "Alex sent a new team message.",
    time: "10m ago",
    unread: true,
    href: "/chat",
  },
  {
    id: 3,
    title: "Project created",
    description: "FlowForge Mobile App project was created.",
    time: "1h ago",
    unread: false,
    href: "/projects",
  },
];

function markNotificationRead(
  notifications: Notification[],
  id: number
) {
  return notifications.map((item) =>
    item.id === id
      ? { ...item, unread: false }
      : item
  );
}

function markAllNotificationsRead(
  notifications: Notification[]
) {
  return notifications.map((notification) => ({
    ...notification,
    unread: false,
  }));
}

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
    
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const unreadCount = notifications.reduce(
    (count, notification) =>
      notification.unread ? count + 1 : count,
    0
  );

  function markAllAsRead() {
    setNotifications(markAllNotificationsRead);
  }

  return (
  <div className="relative" ref={panelRef}>
    <button
      onClick={() => setOpen((prev) => !prev)}
      className="
        relative rounded-full p-2
        text-on-surface-variant
        hover:bg-surface-container-low
        transition-all duration-200
        active:scale-90
      "
      type="button"
    >
      <span className="material-symbols-outlined">
        notifications
      </span>

      {unreadCount > 0 && (
        <span
          className="
            absolute -right-1 -top-1
            flex h-5 min-w-5 items-center justify-center
            rounded-full bg-primary px-1
            text-[10px] font-bold text-white
          "
        >
          {unreadCount}
        </span>
      )}
    </button>

    {open && (
      <div
        className="
          absolute right-0 top-14 z-50
          w-[380px]
          overflow-hidden rounded-2xl
          border border-white/20
          bg-white
          backdrop-blur-xl
          shadow-2xl
          animate-in fade-in zoom-in-95
        "
      >
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <div>
            <h3 className="font-semibold text-on-surface">
              Notifications
            </h3>

            <p className="text-xs text-outline">
              Recent activity and updates
            </p>
          </div>

          <button
            onClick={markAllAsRead}
            className="
              text-xs text-primary
              hover:underline
            "
          >
            Mark all as read
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">
                notifications_off
              </span>

              <h4 className="mt-4 text-sm font-semibold text-slate-700">
                No notifications yet
              </h4>

              <p className="mt-1 text-xs text-slate-500">
                You're all caught up.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => {
                  setNotifications((prev) =>
                    markNotificationRead(
                      prev,
                      notification.id
                    )
                  );

                  setOpen(false);

                  router.push(notification.href);
                }}
                className={`
                  flex w-full items-start gap-3
                  border-b border-slate-200
                  px-5 py-4 text-left
                  transition-all duration-200
                  hover:bg-slate-100
                  ${
                    notification.unread
                      ? "bg-slate-50"
                      : "bg-white"
                  }
                `}
              >
                <div
                  className={`
                    mt-1 h-2.5 w-2.5 rounded-full
                    ${
                      notification.unread
                        ? "bg-primary"
                        : "bg-slate-300"
                    }
                  `}
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold text-on-surface">
                      {notification.title}
                    </h4>

                    <span className="text-[11px] text-outline whitespace-nowrap">
                      {notification.time}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-on-surface-variant">
                    {notification.description}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    )}
  </div>
);
}