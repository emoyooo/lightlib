import express from "express";
import * as achievementController from "../controllers/achievementController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/achievements", achievementController.getUserAchievements);
router.get("/stats", achievementController.getUserStats);

export default router;
