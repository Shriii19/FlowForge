import express from "express";
import { createFeedItem, getFeedItems } from "../controllers/feed.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getFeedItems);

router.post("/", authenticateUser, createFeedItem);

export default router;