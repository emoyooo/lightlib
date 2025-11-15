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

const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("nickname")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Nickname must be between 2 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Nickname can only contain letters, numbers, underscores, and hyphens"
    ),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one digit")
    .matches(/[!@#$%^&*?]/)
    .withMessage("Password must contain at least one special character"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/profile", authenticate, getProfile);
router.post("/logout", authenticate, logout);

export default router;
