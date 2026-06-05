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

// Centralized protection for all task mutation routes
router.use(authenticateUser);

router.get("/", getTasks);

router.post("/", validateTask, createTask);

router.patch("/:id", updateTaskStatus);

router.patch("/:id/edit", updateTask);

router.delete("/:id", deleteTask);

export default router;
