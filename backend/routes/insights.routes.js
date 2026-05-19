import express from "express";
import { getOverviewInsights, getTaskInsights } from "../controllers/insights.controller.js";

const router = express.Router();

router.get("/overview", getOverviewInsights);
router.get("/tasks", getTaskInsights);

export default router;
