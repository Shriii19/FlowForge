import express from "express";
import { createFeedItem, getFeedItems } from "../controllers/feed.controller.js";

const router = express.Router();

router.get("/", getFeedItems);
router.post("/", createFeedItem);

export default router;
