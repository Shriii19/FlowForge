"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  href: string;
};

type NotificationQueueState = {
  lastProcessedId: number | null;
  processedCount: number;
  queueVersion: number;
};

type NotificationLifecycle = {
  createdAt: number;
  expiresAt: number;
};

type NotificationDeliveryState = {
  deliveryVersion: number;
  duplicateEventsPrevented: number;
  cleanupCycles: number;
};

type NotificationValidationResult = {
  valid: boolean;
  reason: string | null;
};



const initialNotifications: Notification[] = [];

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

function reconcileNotifications(
  notifications: Notification[],
  updater: (
    notifications: Notification[]
  ) => Notification[]
) {
  return updater(notifications);
}

function getUnreadCount(
  notifications: Notification[]
) {
  return notifications.reduce(
    (count, notification) =>
      notification.unread
        ? count + 1
        : count,
    0
  );
}

function sortNotificationsByPriority(
  notifications: Notification[]
) {
  return [...notifications].sort(
    (a, b) => b.id - a.id
  );
}

function createNotificationLifecycle(
  notification: Notification
): NotificationLifecycle {
  const createdAt = Date.now();

  return {
    createdAt,
    expiresAt:
      createdAt + 300000,
  };
}

function pruneExpiredNotifications(
  notifications: Notification[],
  lifecycles: Map<
    number,
    NotificationLifecycle
  >
) {
  const now = Date.now();

  return notifications.filter(
    (notification) => {
      const lifecycle =
        lifecycles.get(
          notification.id
        );

      return (
        !lifecycle ||
        lifecycle.expiresAt >
          now
      );
    }
  );
}

function validateNotification(
  notification: Notification
): NotificationValidationResult {
  if (!notification.title.trim()) {
    return {
      valid: false,
      reason: "Missing title",
    };
  }

  if (!notification.href.trim()) {
    return {
      valid: false,
      reason: "Missing destination",
    };
  }

  return {
    valid: true,
    reason: null,
  };
}

function normalizeNotification(
  notification: Notification
): Notification {
  return {
    ...notification,
    title:
      notification.title.trim(),
    description:
      notification.description.trim(),
  };
}

function buildDeliveryMetrics(
  currentVersion: number,
  duplicateEventsPrevented: number,
  cleanupCycles: number
): NotificationDeliveryState {
  return {
    deliveryVersion:
      currentVersion + 1,
    duplicateEventsPrevented,
    cleanupCycles,
  };
}



function isDuplicateNotification(
  id: number,
  processedNotifications: Set<number>,
  timestamps: Map<number, number>
) {
  const now = Date.now();

  const lastSeen =
    timestamps.get(id) ?? 0;

  if (
    processedNotifications.has(id) &&
    now - lastSeen < 5000
  ) {
    return true;
  }

  processedNotifications.add(id);
  timestamps.set(id, now);

  return false;
}

function reconcileNotificationUpdates(
  current: Notification[],
  incoming: Notification
) {
  const existingIndex =
    current.findIndex(
      (notification) =>
        notification.id ===
        incoming.id
    );

  if (existingIndex === -1) {
    return [
      incoming,
      ...current,
    ];
  }

  return current.map(
    (notification) =>
      notification.id ===
      incoming.id
        ? {
            ...notification,
            ...incoming,
          }
        : notification
  );
}

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<Notification[]>(
      initialNotifications
    );

  const [loading, setLoading] = useState(true);

  const panelRef =
    useRef<HTMLDivElement | null>(
      null
    );

    const processedNotificationsRef =
      useRef<Set<number>>(new Set());

    const lastNotificationTimeRef =
      useRef<Map<number, number>>(
        new Map()
      );

    const notificationLifecycleRef =
      useRef<
        Map<
          number,
          NotificationLifecycle
        >
      >(new Map());

    const [
      queueState,
      setQueueState,
    ] = useState<
      NotificationQueueState
    >({
      lastProcessedId: null,
      processedCount: 0,
      queueVersion: 1,
    });

    const [
      deliveryState,
      setDeliveryState,
    ] = useState<NotificationDeliveryState>({
      deliveryVersion: 1,
      duplicateEventsPrevented: 0,
      cleanupCycles: 0,
    });

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        panelRef.current &&
        !panelRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    window.addEventListener(
      "keydown",
      handleEscape
    );

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

  useEffect(() => {
    const simulatedRealtimeUpdate =
      window.setInterval(() => {
        const incomingNotification: Notification = {
          id: 2,
          title:
            "New chat message",
          description:
            "Alex sent a new team message.",
          time: "Just now",
          unread: true,
          href: "/chat",
        };

        if (
          isDuplicateNotification(
            incomingNotification.id,
            processedNotificationsRef.current,
            lastNotificationTimeRef.current
          )
        ) {
          setDeliveryState(
            (current) => ({
              ...current,
              duplicateEventsPrevented:
                current.duplicateEventsPrevented +
                1,
            })
          );

          return;
        }

        const validation =
          validateNotification(
            incomingNotification
          );

        if (!validation.valid) {
          return;
        }

        const normalizedNotification =
          normalizeNotification(
            incomingNotification
          );

        setNotifications(
          (current) => {
            notificationLifecycleRef.current.set(
              incomingNotification.id,
              createNotificationLifecycle(
                normalizedNotification
              )
            );

            return sortNotificationsByPriority(
              reconcileNotificationUpdates(
                current,
                normalizedNotification
              )
            );
          }
        );

        setQueueState(
          (current) => ({
            lastProcessedId:
              incomingNotification.id,
            processedCount:
              current.processedCount + 1,
            queueVersion:
              current.queueVersion + 1,
          })
        );
        setDeliveryState(
          (current) =>
            buildDeliveryMetrics(
              current.deliveryVersion,
              current.duplicateEventsPrevented,
              current.cleanupCycles
            )
        );
      }, 15000);

    return () => {
      window.clearInterval(
        simulatedRealtimeUpdate
      );
    };
  }, []);

  useEffect(() => {
    const cleanupTimer =
      window.setInterval(() => {
        setNotifications(
          (current) =>
            pruneExpiredNotifications(
              current,
              notificationLifecycleRef.current
            )
        );
        setDeliveryState(
          (current) => ({
            ...current,
            cleanupCycles:
              current.cleanupCycles + 1,
          })
        );
      }, 30000);

    return () => {
      window.clearInterval(
        cleanupTimer
      );
    };
  }, []);


  const unreadCount =
    getUnreadCount(
      notifications
    );

  function markAllAsRead() {
    setNotifications(
      (current) =>
        reconcileNotifications(
          current,
          markAllNotificationsRead
        )
    );
  }

  return (
    <div
      className="relative"
      ref={panelRef}
    >
      <button
        onClick={() =>
          setOpen(
            (prev) => !prev
          )
        }
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

        {!loading && unreadCount > 0 && (
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

              <p className="text-[10px] text-outline">
                Queue v{queueState.queueVersion}
                • Processed{" "}
                {queueState.processedCount}
              </p>

              <p className="text-[10px] text-outline">
                Delivery v
                {deliveryState.deliveryVersion}
              </p>

              <p className="text-[10px] text-outline">
                Duplicates Blocked{" "}
                {deliveryState.duplicateEventsPrevented}
              </p>

              <p className="text-[10px] text-outline">
                Cleanup Cycles{" "}
                {deliveryState.cleanupCycles}
              </p>

            </div>

            <button
              onClick={
                markAllAsRead
              }
              className="
                text-xs text-primary
                hover:underline
              "
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length ===
            0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300">
                  notifications_off
                </span>

                <h4 className="mt-4 text-sm font-semibold text-slate-700">
                  No notifications yet
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  You're all caught
                  up.
                </p>
              </div>
            ) : (
              notifications.map(
                (
                  notification
                ) => (
                  <button
                    key={
                      notification.id
                    }
                    data-notification-id={
                      notification.id
                    }
                    onClick={() => {
                      setNotifications(
                        (
                          current
                        ) =>
                          reconcileNotifications(
                            current,
                            (
                              notifications
                            ) =>
                              markNotificationRead(
                                notifications,
                                notification.id
                              )
                          )
                      );

                      setOpen(
                        false
                      );

                      router.push(
                        notification.href
                      );
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
                          {
                            notification.title
                          }
                        </h4>

                        <span className="text-[11px] text-outline whitespace-nowrap">
                          {
                            notification.time
                          }
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-on-surface-variant">
                        {
                          notification.description
                        }
                      </p>
                    </div>
                  </button>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}