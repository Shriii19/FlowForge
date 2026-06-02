import express from "express";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { validateTask } from "../middleware/validation.middleware.js";

const router = express.Router();

router.get("/", authenticateUser, getTasks);
router.post("/", authenticateUser, validateTask, createTask);
router.patch("/:id", authenticateUser, validateTask, updateTaskStatus);
router.patch("/:id/edit", authenticateUser, validateTask, updateTask);
router.delete("/:id", authenticateUser, deleteTask);

export default router;