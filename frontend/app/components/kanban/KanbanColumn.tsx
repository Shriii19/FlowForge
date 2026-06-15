"use client";

import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";
import type { Task, Column } from "./KanbanBoard";
import { Plus } from "lucide-react";

/* ---------------- TYPES ---------------- */

type Props = {
  column: Column;
  tasks: Task[];
  onCreateTask: () => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
};

/* ---------------- COMPONENT ---------------- */

export function KanbanColumn({
  column,
  tasks,
  onCreateTask,
  onDeleteTask,
  onEditTask,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id, // ✅ now correctly typed as TaskStatus
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-(--line) bg-(--bg-soft) overflow-hidden h-full">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-(--line) bg-(--bg) p-4">
        <h3 className="font-semibold text-slate-800">{column.title}</h3>

        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--bg-soft) text-xs font-medium text-slate-500 border border-(--line)">
          {tasks.length}
        </span>
      </div>

      {/* DROP AREA */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 transition-colors ${
          isOver ? "bg-indigo-100 border-2 border-indigo-400 scale-[1.02]" : ""
        }`}
        style={{ minHeight: "200px" }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-gray-400 border-2 border-dashed rounded-lg">
                No tasks yet
              </div>
            ) : (
              tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onDelete={() => onDeleteTask(task.id)}
                  onEditTask={onEditTask}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>

      {/* FOOTER */}
      <div className="border-t border-(--line) p-3">
        <button
          onClick={onCreateTask}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 border border-transparent hover:border-(--line) shadow-sm hover:shadow"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>
    </div>
  );
}