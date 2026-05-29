import express from "express";
import { getMessages, sendMessage } from "../controllers/chat.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getMessages);

router.post("/", authenticateUser, sendMessage);

export default router;