import z from "zod"

export const createSessionName = z.object({
	name:z.string("Name is Required").min(3,"Min 3 letter").max(20,"Max 10 letter only")
})