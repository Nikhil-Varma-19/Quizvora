import { Request, Response } from "express"
import { createGuest } from "../services/quest.service";
import response from "../utils/response.helper";


export const createSession = async (req: Request, res: Response) => {
	const name = req.body.name;

	const result = await createGuest(name);

	return response.created(res, { message: "Session create successfully", data: { name: result.name, sessionId: result.sessionId } })

}