import express from "express";
const router = express.Router();
import { validate } from "../middlewares/validate";
import { errorWrapper } from "../middlewares/errorWrapper";
import { loginSchema, registerSchema } from "../validations/auth";
import { login, register } from "../controllers/auth.controller";



router.post("/login", validate(loginSchema), errorWrapper(login));

router.post("/register", validate(registerSchema), errorWrapper(register));

export default router;