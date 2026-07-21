import { z } from "zod";
import { ModePlay, ResultMode } from "../utils/enums";

export const createRoomValidation = z.object({
	title: z.string("Title Required").min(3,"Min 3 letter").max(100,"Max 100 letter only"),
	mode: z.enum(ModePlay,"Mode can be either live or predefined"),
	resultMode: z.enum(ResultMode,"Result mode can be either perQuestion or atLast")
})