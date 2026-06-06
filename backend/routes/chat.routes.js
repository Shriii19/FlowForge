import express from "express";
import { getMessages, sendMessage } from "../controllers/chat.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { validateMessage } from "../middleware/validation.middleware.js";

const router = express.Router();

router.get("/", authenticateUser, getMessages);
router.post("/", authenticateUser, validateMessage, sendMessage);

export default router;