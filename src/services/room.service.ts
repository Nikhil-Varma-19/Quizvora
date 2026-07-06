import mongoose from "mongoose";
const db = require('../models/index');
import { ModePlay, Role, SessionStatus, UserType } from "../utils/enums";
import { generateCode } from "../utils/generateCode";
import { IGuestData, IUserData, RoomType, sockertUserReq } from "../utils/types";
import { ConflictError, InternalServerError, NotFoundError } from '../utils/errors';

export const isCodeExists = async (code: string): Promise<boolean> =>
	Boolean(await db.Rooms.exists({ code }))


export const createRoom = async (title: string, mode: ModePlay, user: IUserData | undefined | IGuestData, type: UserType | undefined): Promise<RoomType> => {
	const session = await mongoose.startSession();

	try {

		session.startTransaction()

		const createdByType = type === UserType.User ? UserType.User : UserType.Guest

		const createdBy = user?._id

		const code: string = await generateCode()

		const [room]: [RoomType] = await db.Rooms.create([{ title, code, createdBy, createdByType, mode }], { session });

		await db.RoomMembers.create([{
			roomId: room._id,
			participantType: createdByType,
			participantId: createdBy,
			role: Role.Admin
		}], { session })

		if (!room) throw new InternalServerError("Failed to create room, try again later.")

		await session.commitTransaction();
		session.endSession();


		return {
			code: room.code,
			_id: room._id,
			title: room.title,
			createdByType: room.createdByType,
			startedAt: room.startedAt,
			status: room.status
		}
	} catch (error) {
		console.log(error)
		await session.abortTransaction();
		session.endSession();
		throw new InternalServerError("Failed to create room, try again later.")
	}

}

export const joinRoomMember = async (code: string, user: sockertUserReq) => {

	const isRoomPresent = await db.Rooms.findOne({
		code: code,
		status: { $in: [SessionStatus.Running, SessionStatus.Waiting] },
		startedAt: {
			$lte: new Date()
		}
	});

	if (!isRoomPresent) throw new NotFoundError("Check the code again!!")

	const alreadyJoined = await isParticipantAlreadyJoin(isRoomPresent._id, user._id);

	if (alreadyJoined) throw new ConflictError("Already user joined the room.")

	const roomMember = await db.RoomMembers.create({
		roomId: isRoomPresent._id,
		participantType: user.type,
		participantId: user._id,
		role: Role.Member
	})

	return {
		roomId: roomMember.roomId,
		status: isRoomPresent.status
	};
}

export const isParticipantAlreadyJoin = async (roomId: string, participantId: string) => {

	return await db.RoomMembers.findOne({
		roomId,
		participantId,
	});

}

export const getRoomMembers = async (roomId: string) => {

	const roomMemberList = await db.RoomMembers.find({
		roomId: roomId,
		isLeave: false
	})
		.select("score role participantId participantType -_id")
		.populate({
			path: "participantId",
			select: "name -_id",
		})

	return roomMemberList

}

export const roomByIdAndCreatrdBy = async (_id:string,createdBy?:string) => {
	const room = await db.Rooms.findOne({
		_id,
		createdBy
	})

	if (!room) throw new NotFoundError("Room not found");

	return room
}