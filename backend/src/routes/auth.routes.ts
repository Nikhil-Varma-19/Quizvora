import express from "express";
const router = express.Router();
import { validate } from "../middlewares/validate";
import { errorWrapper } from "../middlewares/errorWrapper";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/auth";
import auth from "../middlewares/checkAuth";
import { login, logout, register, forgotPassword, resetPassword } from "../controllers/auth.controller";



router.post("/login", validate(loginSchema), errorWrapper(login));

router.post("/logout", auth, errorWrapper(logout));

router.post("/register", validate(registerSchema), errorWrapper(register));

router.post("/forgot-password", validate(forgotPasswordSchema), errorWrapper(forgotPassword));

router.post("/reset-password", validate(resetPasswordSchema), errorWrapper(resetPassword));

export default router;