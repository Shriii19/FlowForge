import express from "express";
import { createFeedItem, getFeedItems } from "../controllers/feed.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { validateFeedItem } from "../middleware/validation.middleware.js";

const router = express.Router();

router.get("/", getFeedItems);

router.post("/", authenticateUser, createFeedItem);
router.post("/", validateFeedItem, createFeedItem);

export default router;