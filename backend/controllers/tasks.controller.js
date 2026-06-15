import supabase from "../config/db.js";

async function verifyAuthenticatedRequest(req, res) {
  if (!req.user) {
    res.status(401).json({
      error: "Authentication required",
    });

    return false;
  }

  return true;
}

function buildTaskSyncMetadata() {
  return {
    synchronizedAt:
      new Date().toISOString(),
  };
}

function buildTaskConsistencyDiagnostics() {
  return {
    reconciliationVersion: 1,
    conflictDetectionEnabled: true,
    sequencingGuardEnabled: true,
    generatedAt: Date.now(),
  };
}

function buildTaskConflictMetadata(
  existingTask,
  updates
) {
  return {
    conflictCheckedAt:
      Date.now(),
    previousStatus:
      existingTask?.status ??
      null,
    incomingStatus:
      updates?.status ??
      existingTask?.status ??
      null,
    updateSource:
      "task-controller",
  };
}


function reconcileTaskUpdate(
  existingTask,
  updates
) {
  return {
    ...existingTask,
    ...updates,
    ...buildTaskSyncMetadata(),
  };
}

function isStaleTaskUpdate(
  existingTask,
  incomingTimestamp
) {
  if (
    !existingTask?.updated_at ||
    !incomingTimestamp
  ) {
    return false;
  }

  return (
    new Date(
      incomingTimestamp
    ).getTime() <
    new Date(
      existingTask.updated_at
    ).getTime()
  );
}

function buildTaskUpdateSequence(
  existingTask
) {
  return {
    sequenceVersion:
      (
        existingTask
          ?.sequenceVersion ?? 0
      ) + 1,
    sequenceGeneratedAt:
      Date.now(),
  };
}


function buildTaskIntegrityCheckpoint(
  existingTask,
  updates
) {
  return {
    checkpointGeneratedAt:
      Date.now(),
    previousTaskState: {
      status:
        existingTask?.status ??
        null,
      title:
        existingTask?.title ??
        null,
    },
    nextTaskState: {
      status:
        updates?.status ??
        existingTask?.status ??
        null,
      title:
        updates?.title ??
        existingTask?.title ??
        null,
    },
  };
}

function validateTaskTransition(
  existingTask,
  updates
) {
  if (!existingTask) {
    return {
      valid: false,
      error:
        "Task not found",
    };
  }

  if (
    existingTask.status ===
      "done" &&
    updates?.status ===
      "todo"
  ) {
    return {
      valid: false,
      error:
        "Invalid task transition",
    };
  }

  return {
    valid: true,
  };
}

function buildTaskRollbackMetadata(
  existingTask
) {
  return {
    rollbackAvailable:
      true,
    rollbackSnapshotAt:
      Date.now(),
    rollbackState: {
      id:
        existingTask?.id ??
        null,
      status:
        existingTask?.status ??
        null,
      title:
        existingTask?.title ??
        null,
      description:
        existingTask?.description ??
        null,
    },
  };
}





// Get all tasks
export const getTasks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, status, position } = req.body;

    // Validate required fields and enforce length limits before any database
    // operation. Without these checks an authenticated user could insert empty
    // titles, megabyte-length descriptions, or strings containing control
    // characters, corrupting data visible to all team members.
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "Task title is required." });
    }
    if (title.length > 200) {
      return res.status(400).json({ error: "Task title must not exceed 200 characters." });
    }
    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        return res.status(400).json({ error: "Task description must be a string." });
      }
      if (description.length > 5000) {
        return res.status(400).json({ error: "Task description must not exceed 5000 characters." });
      }
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title, description, status, position }])
      .select();

    if (error) throw error;
    
    // Emit event through socket
    const io = req.app.get("io");
    if (io && data.length > 0) {
      io.emit("task-created", data[0]);
    }
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

//update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!(await verifyAuthenticatedRequest(req, res))) {
      return;
    }
    const { status, position } = req.body;


    const { data: existingTask } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const {
      synchronizedAt,
    } = req.body;

    const consistencyDiagnostics =
      buildTaskConsistencyDiagnostics();

    const conflictMetadata =
      buildTaskConflictMetadata(
        existingTask,
        {
          status,
          position,
        }
      );

    const updateSequence =
      buildTaskUpdateSequence(
        existingTask
      );

    const transitionValidation =
      validateTaskTransition(
        existingTask,
        {
          status,
        }
      );

    if (
      !transitionValidation.valid
    ) {
      return res.status(409).json({
        error:
          transitionValidation.error,
      });
    }

    const integrityCheckpoint =
      buildTaskIntegrityCheckpoint(
        existingTask,
        {
          status,
        }
      );

    const rollbackMetadata =
      buildTaskRollbackMetadata(
        existingTask
      );
      
    if (
      isStaleTaskUpdate(
        existingTask,
        synchronizedAt
      )
    ) {
      return res.status(409).json({
        error:
          "Stale task update detected",
      });
    }

    const validStatuses = ["todo", "in_progress", "done"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid task status",
      });
    }

    if (
      position !== undefined &&
      (typeof position !== "number" || position < 0)
    ) {
      return res.status(400).json({
        error: "Invalid task position",
      });
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(
        reconcileTaskUpdate(
          existingTask,
          {
            status,
            position,
            ...consistencyDiagnostics,
            ...conflictMetadata,
            ...updateSequence,
            ...integrityCheckpoint,
            ...rollbackMetadata,
          }
        )
      )
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const io = req.app.get("io");

    if (io && data[0]) {
      io.emit(
        "task-status-synchronized",
        data[0]
      );
    }

    res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({
      error: "Failed to update task status",
    });
  }
};
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!(await verifyAuthenticatedRequest(req, res))) {
      return;
    }
    const { title, description, status } = req.body;
    const { data: existingTask } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const {
      synchronizedAt,
    } = req.body;

    const consistencyDiagnostics =
      buildTaskConsistencyDiagnostics();

    const conflictMetadata =
      buildTaskConflictMetadata(
        existingTask,
        {
          status,
        }
      );

    const updateSequence =
      buildTaskUpdateSequence(
        existingTask
      );

    const transitionValidation =
      validateTaskTransition(
        existingTask,
        {
          status,
          title,
        }
      );

    if (
      !transitionValidation.valid
    ) {
      return res.status(409).json({
        error:
          transitionValidation.error,
      });
    }

    const integrityCheckpoint =
      buildTaskIntegrityCheckpoint(
        existingTask,
        {
          status,
          title,
        }
      );

    const rollbackMetadata =
      buildTaskRollbackMetadata(
        existingTask
      );

    if (
      isStaleTaskUpdate(
        existingTask,
        synchronizedAt
      )
    ) {
      return res.status(409).json({
        error:
          "Stale task update detected",
      });
    }
    
    const updateFields = {};

    // Apply the same length limits as createTask so an authenticated user
    // cannot bypass creation-time validation by patching an existing task.
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "Task title is required." });
      }
      if (title.length > 200) {
        return res.status(400).json({ error: "Task title must not exceed 200 characters." });
      }
      updateFields.title = title;
    }
    if (description !== undefined) {
      if (description !== null) {
        if (typeof description !== "string") {
          return res.status(400).json({ error: "Task description must be a string." });
        }
        if (description.length > 5000) {
          return res.status(400).json({ error: "Task description must not exceed 5000 characters." });
        }
      }
      updateFields.description = description;
    }

    // Validate status if provided
    const validStatus = ["todo", "in_progress", "done"];
    if (status !== undefined) {
      if (!validStatus.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      updateFields.status = status;
    }

    // Prevent empty update request
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Update task in database
    const { data, error } = await supabase
      .from("tasks")
      .update(
        reconcileTaskUpdate(
          existingTask,
          {
            ...updateFields,
            ...consistencyDiagnostics,
            ...conflictMetadata,
            ...updateSequence,
            ...integrityCheckpoint,
            ...rollbackMetadata,
          }
        )
      )
      .eq("id", id)
      .select();

    if (error) throw error;

    // Handle case where task does not exist
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTask = data[0];

    // Emit real-time update event
    const io = req.app.get("io");
    if (io && updatedTask) {
      io.emit("task-updated", updatedTask);
    }

    // Send updated task as response
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!(await verifyAuthenticatedRequest(req, res))) {
      return;
    }

    const { data: existingTask } = await supabase
      .from("tasks")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Emit event through socket
    const io = req.app.get("io");
    if (io) {
      io.emit("task-deleted", id);
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};
