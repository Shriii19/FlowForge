"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType
  ) => void;
}

const ToastContext =
  createContext<ToastContextValue>({
    showToast: () => {},
  });

const MAX_TOASTS = 4;

function createToast(
  message: string,
  type: ToastType
): Toast {
  return {
    id: Date.now(),
    message,
    type,
  };
}

function scheduleToastRemoval(
  id: number,
  removeToast: (id: number) => void
) {
  return window.setTimeout(() => {
    removeToast(id);
  }, 4000);
}

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] =
    useState<Toast[]>([]);

  const removeToast = useCallback(
    (id: number) => {
      setToasts((prev) =>
        prev.filter(
          (toast) => toast.id !== id
        )
      );
    },
    []
  );

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info"
    ) => {
      const toast = createToast(
        message,
        type
      );

      const { id } = toast;

      setToasts((prev) => {
        const duplicateExists =
          prev.some(
            (existingToast) =>
              existingToast.message ===
                message &&
              existingToast.type ===
                type
          );

        if (duplicateExists) {
          return prev;
        }

        const updated = [
          ...prev,
          toast,
        ];

        if (
          updated.length > MAX_TOASTS
        ) {
          updated.shift();
        }

        return updated;
      });

      scheduleToastRemoval(
        id,
        removeToast
      );
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast }}
    >
      {children}

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 animate-slide-in
              ${
                toast.type === "success"
                  ? "bg-emerald-600 text-white"
                  : ""
              }
              ${
                toast.type === "error"
                  ? "bg-red-600 text-white"
                  : ""
              }
              ${
                toast.type === "info"
                  ? "bg-slate-800 text-white"
                  : ""
              }
            `}
          >
            <span className="flex-1">
              {toast.message}
            </span>

            <button
              onClick={() =>
                removeToast(
                  toast.id
                )
              }
              className="ml-2 text-white opacity-70 hover:opacity-100 transition text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}