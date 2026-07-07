import { z } from "zod";

export const answerSchema = z.object({
	roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID"),
	questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid question ID"),
	answer: z.string().min(1, "Answer is required").max(100, "Answer must be at most 100 characters").optional(),
	optionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid option ID").optional(),
}).refine((data) =>
	data.answer || data.optionId, {
	message: "Either answer or optionId must be provided",
	path: ['answer', 'optionId'],
})
	;
