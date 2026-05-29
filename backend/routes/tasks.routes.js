import express from "express";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getTasks);

router.post("/", authenticateUser, createTask);

router.patch("/:id", authenticateUser, updateTaskStatus);

router.patch("/:id/edit", authenticateUser, updateTask);

router.delete("/:id", authenticateUser, deleteTask);

export default router;