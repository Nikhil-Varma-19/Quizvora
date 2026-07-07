import { z } from "zod";
import { ModePlay } from "../utils/enums";

export const createRoomValidation = z.object({
	title: z.string("Title Required").min(3,"Min 3 letter").max(100,"Max 100 letter only"),
	mode: z.enum(ModePlay,"Mode can be either live or predefined")
})