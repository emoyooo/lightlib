import express from "express";
import * as libraryController from "../controllers/libraryController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", libraryController.addToLibrary);
router.get("/", libraryController.getLibrary);
router.patch("/:bookId/status", libraryController.updateBookStatus);
router.delete("/:bookId", libraryController.removeFromLibrary);

export default router;
