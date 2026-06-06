"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Project = {
  id: string;
  name: string;
  desc: string;
  members: number;
  due: string | null;
  tags: string[];
  createdAt: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
};

function resetProjectForm(
  setPname: (value: string) => void,
  setPDesc: (value: string) => void,
  setPTeamSize: (value: number) => void,
  setPDeadline: (value: string) => void,
  setError: (value: string) => void
) {
  setError("");
  setPname("");
  setPDesc("");
  setPTeamSize(0);
  setPDeadline("");
}

async function resolveSessionToken() {
  if (!supabase) {
    throw new Error(
      "Supabase client not available"
    );
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (
    error ||
    !session?.access_token
  ) {
    throw new Error(
      "Unauthorized, please sign in to create a project."
    );
  }

  return session.access_token;
}

export default function ProjectDialog({
  isOpen,
  onClose,
  onCreated,
}: Props) {
  const [Pname, setPname] =
    useState("");

  const [Pdesc, setPDesc] =
    useState("");

  const [
    PteamSize,
    setPTeamSize,
  ] = useState(0);

  const [
    Pdeadline,
    setPDeadline,
  ] = useState<string>("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const initialFocusRef =
    useRef<HTMLInputElement | null>(
      null
    );

  useEffect(() => {
    if (isOpen) {
      setTimeout(
        () =>
          initialFocusRef.current?.focus(),
        0
      );

      const onKey = (
        e: KeyboardEvent
      ) => {
        if (
          e.key === "Escape" &&
          !loading
        ) {
          onClose();
        }
      };

      window.addEventListener(
        "keydown",
        onKey
      );

      return () =>
        window.removeEventListener(
          "keydown",
          onKey
        );
    }
  }, [
    isOpen,
    loading,
    onClose,
  ]);

  const close = () => {
    if (loading) return;

    resetProjectForm(
      setPname,
      setPDesc,
      setPTeamSize,
      setPDeadline,
      setError
    );

    onClose();
  };

  const submit = async () => {
    setError("");

    if (!Pname.trim()) {
      setError(
        "Project name is required."
      );
      return;
    }

    setLoading(true);

    try {
      let token: string;

      try {
        token =
          await resolveSessionToken();
      } catch (error) {
        setError(
          (error as Error).message
        );
        setLoading(false);
        return;
      }

      const res = await fetch(
        "/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: Pname.trim(),
            desc: Pdesc.trim(),
            members: PteamSize,
            due: Pdeadline
              ? new Date(
                  Pdeadline
                ).toISOString()
              : null,
          }),
        }
      );

      const payload =
        await res.json();

      if (!res.ok) {
        setError(
          payload.error ||
            "Failed to create project."
        );
        setLoading(false);
        return;
      }

      onCreated?.(
        payload.project
      );

      close();
    } catch (err) {
      setError(
        "An unexpected error occurred."
      );

      console.error(
        "Project creation error:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => {
          if (!loading) close();
        }}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          Add Project
        </h3>

        <label className="block mb-2 text-sm text-black">
          Project Name *
        </label>

        <input
          ref={initialFocusRef}
          type="text"
          value={Pname}
          onChange={(e) =>
            setPname(
              e.target.value
            )
          }
          className="w-full p-2 mb-3 bg-#FFFFFF rounded border border-zinc-700 focus:outline-none focus:border-indigo-500"
          placeholder="Enter project name"
          disabled={loading}
        />

        <label className="block mb-2 text-sm text-black">
          Description
        </label>

        <textarea
          value={Pdesc}
          onChange={(e) =>
            setPDesc(
              e.target.value
            )
          }
          className="w-full p-2 mb-3 bg-#FFFFFF rounded border border-zinc-700 focus:outline-none focus:border-indigo-500"
          placeholder="Enter project description"
          rows={3}
          disabled={loading}
        />

        <label className="block mb-2 text-sm text-black">
          Team Size
        </label>

        <input
          type="number"
          value={PteamSize}
          onChange={(e) =>
            setPTeamSize(
              parseInt(
                e.target.value
              ) || 0
            )
          }
          className="w-full p-2 mb-3 bg-#FFFFFF rounded border border-zinc-700 focus:outline-none focus:border-indigo-500"
          placeholder="0"
          disabled={loading}
          min="0"
        />

        <label className="block mb-2 text-sm text-black">
          Deadline
        </label>

        <input
          type="date"
          value={Pdeadline}
          onChange={(e) =>
            setPDeadline(
              e.target.value
            )
          }
          className="w-full p-2 mb-3 bg-white-600 rounded border border-zinc-700 focus:outline-none focus:border-indigo-500"
          disabled={loading}
        />

        {error && (
          <p className="text-sm text-red-400 mb-3 bg-red-900/20 p-2 rounded">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={close}
            disabled={loading}
            className="rounded bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-bold"
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="rounded bg-teal-700 text-white px-3 py-2 text-sm hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
          >
            {loading
              ? "Creating..."
              : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}