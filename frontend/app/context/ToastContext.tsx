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
const TOAST_DURATION = 4000;

type ToastContextSnapshot = {
  activeToastCount: number;
  latestToastId: number;
  generatedAt: number;
};

function buildToastContextSnapshot(
  toasts: Toast[],
  latestToastId: number
): ToastContextSnapshot {
  return {
    activeToastCount: toasts.length,
    latestToastId,
    generatedAt: Date.now(),
  };
}

function validateToastContext(
  snapshot: ToastContextSnapshot
) {
  return {
    isValid:
      snapshot.activeToastCount >= 0,
    checkedAt: Date.now(),
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

  const toastIdRef = useRef(0);

  const [contextSnapshot, setContextSnapshot] =
    useState<ToastContextSnapshot>({
      activeToastCount: 0,
      latestToastId: 0,
      generatedAt: Date.now(),
    });

  const toastTimersRef =
    useRef<
      Map<number, NodeJS.Timeout>
    >(new Map());

  const createToast = useCallback(
    (
      message: string,
      type: ToastType
    ): Toast => {
      toastIdRef.current += 1;

      return {
        id: toastIdRef.current,
        message,
        type,
      };
    },
    []
  );

  const clearToastTimer =
    useCallback((id: number) => {
      const timer =
        toastTimersRef.current.get(id);

      if (timer) {
        clearTimeout(timer);
        toastTimersRef.current.delete(id);
      }
    }, []);

  const removeToast = useCallback(
    (id: number) => {
      clearToastTimer(id);

      setToasts((prev) =>
        prev.filter(
          (toast) => toast.id !== id
        )
      );
    },
    [clearToastTimer]
  );

  const scheduleToastRemoval =
    useCallback(
      (id: number) => {
        clearToastTimer(id);

        const timer =
          setTimeout(() => {
            removeToast(id);
          }, TOAST_DURATION);

        toastTimersRef.current.set(
          id,
          timer
        );
      },
      [
        clearToastTimer,
        removeToast,
      ]
    );

  const evictOldestToast =
    useCallback(
      (toastList: Toast[]) => {
        if (
          toastList.length <=
          MAX_TOASTS
        ) {
          return toastList;
        }

        const oldestToast =
          toastList[0];

        if (oldestToast) {
          clearToastTimer(
            oldestToast.id
          );
        }

        return toastList.slice(1);
      },
      [clearToastTimer]
    );

  const findExistingToast =
    useCallback(
      (
        toastList: Toast[],
        message: string,
        type: ToastType
      ) => {
        return toastList.find(
          (toast) =>
            toast.message ===
              message &&
            toast.type === type
        );
      },
      []
    );

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info"
    ) => {
      let toastToSchedule:
        | number
        | null = null;

      setToasts((prev) => {
        const existingToast =
          findExistingToast(
            prev,
            message,
            type
          );

        if (existingToast) {
          toastToSchedule =
            existingToast.id;

          const filteredToasts =
            prev.filter(
              (toast) =>
                toast.id !==
                existingToast.id
            );

          return [
            ...filteredToasts,
            existingToast,
          ];
        }

        const newToast =
          createToast(
            message,
            type
          );

        toastToSchedule =
          newToast.id;

        const updatedToasts = [
          ...prev,
          newToast,
        ];

        return evictOldestToast(
          updatedToasts
        );
      });

      if (
        toastToSchedule !== null
      ) {
        scheduleToastRemoval(
          toastToSchedule
        );
      }
    },
    [
      createToast,
      evictOldestToast,
      findExistingToast,
      scheduleToastRemoval,
    ]
  );

  useEffect(() => {
    const snapshot =
      buildToastContextSnapshot(
        toasts,
        toastIdRef.current
      );

    const validation =
      validateToastContext(
        snapshot
      );

    if (validation.isValid) {
      setContextSnapshot(snapshot);
    }
  }, [toasts]);

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
      <div className="hidden">
        {contextSnapshot.activeToastCount}
        {contextSnapshot.latestToastId}
      </div>

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