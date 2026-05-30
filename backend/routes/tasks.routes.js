import express from "express";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller.js";

import { validateTask } from "../middleware/validation.middleware.js";

const router = express.Router();

router.get("/", getTasks);

router.post("/", validateTask, createTask);

router.patch("/:id", validateTask, updateTaskStatus);

router.patch("/:id/edit", validateTask, updateTask);

router.delete("/:id", deleteTask);

export default router;