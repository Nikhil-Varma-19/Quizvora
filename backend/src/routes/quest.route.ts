import express from "express";
const router = express.Router();
import { validate } from "../middlewares/validate";
import { errorWrapper } from "../middlewares/errorWrapper";
import checkAuth from "../middlewares/checkAuth"
import { createSessionName } from "../validations/guest.validation";
import { createSession } from "../controllers/quest.controller";

router.post("/create",checkAuth,validate(createSessionName),errorWrapper(createSession))

export default router;