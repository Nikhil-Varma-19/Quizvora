import express from "express";
const router = express.Router();
import { validate } from "../middlewares/validate";
import { errorWrapper } from "../middlewares/errorWrapper";
import checkAuth from "../middlewares/checkAuth";
import {
	roomParamsSchema,
	questionRouteParamsSchema,
	questionSchema,
} from "../validations/question.validation";
import { postLiveQuestion } from "../controllers/question.controller";


router.post("/:roomId",checkAuth,validate(roomParamsSchema,"params"),validate(questionSchema),errorWrapper(postLiveQuestion))



export default router;
