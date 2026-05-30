import express from "express";
import { getMessages, sendMessage } from "../controllers/chat.controller.js";

import { validateMessage } from "../middleware/validation.middleware.js";

const router = express.Router();

router.get("/", getMessages);

router.post("/", validateMessage, sendMessage);

export default router;