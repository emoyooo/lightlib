import express from "express";
import * as bookController from "../controllers/bookController.js";

const router = express.Router();

router.get("/search", bookController.searchBooks);
router.get("/", bookController.getBooks);
router.get("/:id", bookController.getBookById);
router.get("/:id/content", bookController.getBookContent);

export default router;
