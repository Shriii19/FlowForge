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
const protectedRouter = express.Router();

router.get("/", getTasks);

/**
* Protected task mutation routes
 */
protectedRouter.use(authenticateUser);

protectedRouter.post("/", createTask);
protectedRouter.patch("/:id", updateTaskStatus);
protectedRouter.patch("/:id/edit", updateTask);
protectedRouter.delete("/:id", deleteTask);

router.use("/", protectedRouter);

export default router;