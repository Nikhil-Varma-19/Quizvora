import { z } from "zod";
import { ModePlay } from "../utils/enums";

export const createRoomValidation = z.object({
	title: z.string("Title Required").min(3,"Min 3 letter").max(10,"Max 10 letter only"),
	mode: z.enum(ModePlay)
})