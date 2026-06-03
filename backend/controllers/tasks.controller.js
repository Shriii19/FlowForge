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
      .select("id")
      .eq("id", id)
      .single();

    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
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
      .update({ status, position })
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        error: "Task not found",
      });
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
      .select("id")
      .eq("id", id)
      .single();

    if (!existingTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }
    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;

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
      .update(updateFields)
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
