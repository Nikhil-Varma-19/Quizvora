import express from "express";
const router = express.Router();
import { validate } from "../middlewares/validate";
import { errorWrapper } from "../middlewares/errorWrapper";
import checkAuth from "../middlewares/checkAuth";
import {
  createQuizSchema,
  roomParamsSchema,
  questionRouteParamsSchema,
  questionSchema,
} from "../validations/question.validation";
import {
  createQuestionController,
  fetchQuestions,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller";

router.post(
  "/:roomId",
  checkAuth,
  validate(roomParamsSchema, "params"),
  validate(createQuizSchema, "body"),
  errorWrapper(createQuestionController),
);

router.get(
  "/:roomId",
  checkAuth,
  validate(roomParamsSchema, "params"),
  errorWrapper(fetchQuestions),
);

router.patch(
  "/:roomId/:questionId",
  checkAuth,
  validate(questionRouteParamsSchema, "params"),
  validate(questionSchema),
  errorWrapper(updateQuestion),
);

router.delete(
  "/:roomId/:questionId",
  checkAuth,
  validate(questionRouteParamsSchema, "params"),
  errorWrapper(deleteQuestion),
);

export default router;
