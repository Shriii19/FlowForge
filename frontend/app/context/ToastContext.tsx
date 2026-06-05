"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});
const MAX_TOASTS = 4;
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now();

      setToasts((prev) => {
        const duplicateExists = prev.some(
          (toast) =>
            toast.message === message &&
            toast.type === type
        );

        if (duplicateExists) {
          return prev;
        }

        const updated = [
          ...prev,
          { id, message, type },
        ];

        if (updated.length > MAX_TOASTS) {
          updated.shift();
        }

        return updated;
      });

      setTimeout(() => {
        setToasts((prev) =>
          prev.filter((t) => t.id !== id)
        );
      }, 4000);
    },
    []
  );

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — fixed top-right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 animate-slide-in
              ${toast.type === "success" ? "bg-emerald-600 text-white" : ""}
              ${toast.type === "error" ? "bg-red-600 text-white" : ""}
              ${toast.type === "info" ? "bg-slate-800 text-white" : ""}
            `}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
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