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

export type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  position: number;
  project_id: string;
};

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
] as const;

type TaskStatus = Task["status"];

function isTaskStatus(value: unknown): value is TaskStatus {
  return COLUMNS.some((column) => column.id === value);
}

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const handleEditTask = async (task: Task) => {
  const newTitle = window.prompt("Edit title:", task.title);
  if (!newTitle) return;

  const newDescription = window.prompt(
    "Edit description:",
    task.description
  );

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
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
        }),
      }
    );
  } catch (error) {
    console.error("Failed to update task", error);
  }
};

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  useEffect(() => {
    // Assuming backend runs on 5000 in dev
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const newSocket = io(apiUrl);
    socketRef.current = newSocket;
    newSocket.emit("join", {
      username: "kanban-user",
      room: "project-alpha",
    });

    const loadTimer = window.setTimeout(() => {
      void fetchTasks();
    }, 0);

    newSocket.on("task-moved", (movedTask: Task) => {
      setTasks((prev) => {
        const existing = prev.find((t) => t.id === movedTask.id);
        let newTasks;
        if (existing) {
          newTasks = prev.map((t) => (t.id === movedTask.id ? movedTask : t));
        } else {
          newTasks = [...prev, movedTask];
        }
        return newTasks.sort((a, b) => a.position - b.position);
      });
    });

    newSocket.on("task-created", (newTask: Task) => {
      setTasks((prev) => [...prev, newTask].sort((a, b) => a.position - b.position));
    });

    newSocket.on("task-updated", (updatedTask: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    });

    newSocket.on("task-deleted", (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    });

    return () => {
      window.clearTimeout(loadTimer);
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Dropping a Task over an empty column
    const isOverColumn = over.data.current?.type === "Column";
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newTasks = [...tasks];
        if (activeIndex === -1 || !isTaskStatus(overId)) return tasks;
        newTasks[activeIndex].status = overId;
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
  setActiveTask(null);

  const { active, over } = event;
  if (!over) return;

  const activeId = active.id;
  const overId = over.id;

  const activeTask = tasks.find((t) => t.id === activeId);
  if (!activeTask) return;

  let newStatus = activeTask.status;

  if (over.data.current?.type === "Column") {
    if (!isTaskStatus(over.id)) return;
    newStatus = over.id;
  } else if (over.data.current?.type === "Task") {
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      newStatus = overTask.status;
    }
  }

  // Create updated task list
  let updatedTasks = [...tasks];

  // Update dragged task status
  updatedTasks = updatedTasks.map((task) =>
    task.id === activeId
      ? { ...task, status: newStatus }
      : task
  );

  // Get tasks of affected column
  const columnTasks = updatedTasks
    .filter((task) => task.status === newStatus)
    .sort((a, b) => a.position - b.position);

  // Reassign positions sequentially
  const reorderedTasks = columnTasks.map((task, index) => ({
    ...task,
    position: index,
  }));

  // Merge back updated positions
  updatedTasks = updatedTasks.map((task) => {
    const updated = reorderedTasks.find((t) => t.id === task.id);
    return updated || task;
  });

  // Update frontend state
  setTasks(updatedTasks);

  try {
    const session = await supabase?.auth.getSession();

    const token = session?.data.session?.access_token;
    // Send updates for all affected tasks
    await Promise.all(
      reorderedTasks.map((task) =>
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks/${task.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: task.status,
              position: task.position,
            }),
          }
        )
      )
    );

    // Emit socket updates
    if (socketRef.current) {
      reorderedTasks.forEach((task) => {
        socketRef.current?.emit("task-moved", {
          room: "project-alpha",
          task,
        });
      });
    }
  } catch (error) {
    console.error("Failed to update task positions", error);
  }
};

    

  const handleCreateTask = async (columnId: string) => {
    const title = window.prompt("Task Title:");
    if (!title?.trim()) return;

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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });
      // Task creation will be broadcasted by backend and handled by our socket listener
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const session = await supabase?.auth.getSession();

      const token = session?.data.session?.access_token;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full flex-col gap-6 lg:flex-row h-full">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasks.filter((task) => task.status === col.id)}
            onCreateTask={() => handleCreateTask(col.id)}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }) }}>
        {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
