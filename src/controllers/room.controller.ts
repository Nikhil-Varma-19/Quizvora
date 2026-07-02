import { Request, Response } from "express";
import response from "../utils/response.helper";
import { createRoom } from "../services/room.service";
import { IGuestData, IUserData } from "../utils/types";
import { UserType } from "../utils/enums";

export const createRoomController = async (req: Request,res:Response) => {
	const {title,mode} = req.body;
	const user : IUserData | undefined | IGuestData = req.user 
	const type: UserType | undefined = req.type
	const result = await createRoom(title,mode,user,type);

	return response.created(res,{message: "Room create successfully", data : result})

}
