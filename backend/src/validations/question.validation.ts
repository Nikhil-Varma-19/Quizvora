import { z } from "zod";
import { TypeQuestion } from "../utils/enums";

export const roomParamsSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID"),
});

export const questionRouteParamsSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  questionId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});


const optionSchema = z.object({
	text: z.string("Option is required").min(1).max(50),
	isCorrect: z.boolean()
})

 export const mcqQuestionSchema = z.object({
  question: z
    .string()
    .min(3, "Question is required")
    .max(100),
  type: z.literal(TypeQuestion.Mcq),
  options: z.array(optionSchema).min(2,"At least two options are required").max(5,"At most five options are allowed"),
}).strict();

const writtenQuestionSchema = z.object({
  question: z
    .string("Question is required")
    .min(3, "Question is required")
    .max(100),
  type: z.literal(TypeQuestion.Written),
}).strict();

export const questionSchema = z.discriminatedUnion("type", [
  mcqQuestionSchema,
  writtenQuestionSchema,
]);

export const createQuizSchema = z.object({
  noOfQuestion: z.number().int().positive(),
	questionDuration: z.number().int().gte(0).lte(150),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
}).superRefine((data, ctx) => {
  if (data.questions.length !== data.noOfQuestion) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["questions"],
      message: "questions length must match noOfQuestion",
    });
  }
});

