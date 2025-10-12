import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getProfile,
  logout,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Validation rules
const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("nickname")
    .optional({ values: "falsy" }) // Change this line - treats empty strings as optional
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Nickname must be between 2 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Nickname can only contain letters, numbers, underscores, and hyphens"
    ),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/profile", authenticate, getProfile);
router.post("/logout", authenticate, logout);

export default router;
