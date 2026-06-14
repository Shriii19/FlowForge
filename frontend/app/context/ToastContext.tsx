"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
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

  const toastTimersRef =
    useRef<
      Map<number, NodeJS.Timeout>
    >(new Map());

  const removeToast = useCallback(
    (id: number) => {
      const timer =
        toastTimersRef.current.get(id);

      if (timer) {
        clearTimeout(timer);
        toastTimersRef.current.delete(id);
      }

      setToasts((prev) =>
        prev.filter(
          (toast) => toast.id !== id
        )
      );
    },
    []
  );

  const registerToastLifecycle =
    useCallback(
      (id: number) => {
        const existingTimer =
          toastTimersRef.current.get(id);

        if (existingTimer) {
          clearTimeout(
            existingTimer
          );
        }

        const timer: NodeJS.Timeout =
          setTimeout(() => {
            removeToast(id);
          }, 4000);

        toastTimersRef.current.set(
          id,
          timer
        );
      },
      [removeToast]
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
          updated.length >
          MAX_TOASTS
        ) {
          const removedToast =
            updated.shift();

          if (removedToast) {
            const timer =
              toastTimersRef.current.get(
                removedToast.id
              );

            if (timer) {
              clearTimeout(
                timer
              );

              toastTimersRef.current.delete(
                removedToast.id
              );
            }
          }
        }

        return updated;
      });

      registerToastLifecycle(id);
    },
    [registerToastLifecycle]
  );

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach(
        (timer) =>
          clearTimeout(timer)
      );

      toastTimersRef.current.clear();
    };
  }, []);

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