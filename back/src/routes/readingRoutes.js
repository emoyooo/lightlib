import express from "express";
import * as readingController from "../controllers/readingController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/progress", readingController.updateProgress);
router.get("/progress/:bookId", readingController.getProgress);
router.post("/bookmarks", readingController.addBookmark);
router.get("/bookmarks/:bookId", readingController.getBookmarks);
router.delete("/bookmarks/:id", readingController.deleteBookmark);

export default router;
