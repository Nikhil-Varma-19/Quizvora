import { z } from "zod";
import { ModePlay, ResultMode } from "../utils/enums";


export const craeteRoom = z.object({
	title: z.string("Title is required").min(3,"Min 3 letter should be there.").max(50,"max 50 letter should be there."),
	mode : z.enum(ModePlay),
	resultMode: z.enum(ResultMode)
})