"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { io } from "socket.io-client";

/* ---------------- TYPES ---------------- */

export type TaskStatus = "todo" | "in_progress" | "done";

export type Column = {
  id: TaskStatus;
  title: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  project_id: string;
};

/* ---------------- CONSTANTS ---------------- */

export const COLUMNS: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

/* ---------------- TYPE GUARD ---------------- */

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "todo" || value === "in_progress" || value === "done";
}

/* ---------------- COMPONENT ---------------- */

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const isSyncingRef = useRef(false);
  const isDraggingRef = useRef(false);

  const previousTasksRef = useRef<Task[]>([]);
  const dragOperationRef = useRef<string | null>(null);
  const lastSocketUpdateRef = useRef<Map<string, number>>(new Map());

  /* ---------------- FETCH ---------------- */

  const fetchTasks = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks`
      );

      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : data?.tasks || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const isDuplicateRealtimeUpdate = (task: Task) => {
    const now = Date.now();
    const last = lastSocketUpdateRef.current.get(task.id) ?? 0;

    if (now - last < 500) return true;

    lastSocketUpdateRef.current.set(task.id, now);
    return false;
  };

  const snapshotTasks = (tasks: Task[]) =>
    tasks.map((t) => ({ ...t }));

  const rollback = () => setTasks(previousTasksRef.current);

  const normalizeColumnPositions = (list: Task[]) => {
    const result: Task[] = [];

    for (const column of COLUMNS) {
      const columnTasks = list
        .filter((t) => t.status === column.id)
        .sort((a, b) => a.position - b.position);

      columnTasks.forEach((task, index) => {
        result.push({ ...task, position: index });
      });
    }

    return result;
  };

  /* ---------------- HANDLERS (FIXED) ---------------- */

  const handleCreateTask = async (columnId: string) => {
    const title = window.prompt("Task Title:");
    if (!title) return;

    const newTask = {
      title,
      description: "",
      status: columnId,
      project_id: "default",
      position: tasks.filter((t) => t.status === columnId).length,
    };

    try {
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTask),
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTask = async (task: Task) => {
    const title = window.prompt("Edit title", task.title);
    if (!title) return;

    const description = window.prompt("Edit description", task.description);

    try {
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks/${task.id}/edit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description }),
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- SOCKET ---------------- */

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socket = io(apiUrl);

    socketRef.current = socket;

    socket.emit("join", {
      username: "kanban-user",
      room: "project-alpha",
    });

    const timer = setTimeout(fetchTasks, 0);

    return () => {
      clearTimeout(timer);
      socket.disconnect();
    };
  }, []);

  /* ---------------- DRAG ---------------- */

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    dragOperationRef.current = String(event.active.id);
    isDraggingRef.current = true;

    previousTasksRef.current = snapshotTasks(tasks);

    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    isSyncingRef.current = true;
    setActiveTask(null);

    const { active, over } = event;

    if (!over) {
      isDraggingRef.current = false;
      isSyncingRef.current = false;
      return;
    }

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    let newStatus: TaskStatus = task.status;

    if (isTaskStatus(over.id)) {
      newStatus = over.id;
    }

    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, status: newStatus } : t
    );

    setTasks(normalizeColumnPositions(updated));

    try {
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks/${task.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
    } catch (err) {
      rollback();
    }

    dragOperationRef.current = null;
    isDraggingRef.current = false;
    isSyncingRef.current = false;
  };

  /* ---------------- UI ---------------- */

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="hidden">
        Render v
        {renderMetrics.renderVersion}
        |
        Optimized
        {renderMetrics.optimizedUpdates}
        |
        Skipped
        {renderMetrics.skippedUpdates}
      </div>

      <div className="flex w-full flex-col gap-6 lg:flex-row h-full">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasks.filter((t) => t.status === col.id)}
            onCreateTask={() => handleCreateTask(col.id)}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: "0.4" } },
          }),
        }}
      >
        {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}