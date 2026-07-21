import mongoose from "mongoose";
const db = require('../models/index');
import { ModePlay, ResultMode, Role, SessionStatus, UserType } from "../utils/enums";
import { generateCode } from "../utils/generateCode";
import { IGuestData, IUserData, RoomType, sockertUserReq } from "../utils/types";
import { ConflictError, InternalServerError, NotFoundError } from '../utils/errors';

export const isCodeExists = async (code: string): Promise<boolean> =>
	Boolean(await db.Rooms.exists({ code }))


export const createRoom = async (title: string, mode: ModePlay, resultMode: ResultMode, user: IUserData | undefined | IGuestData, type: UserType | undefined): Promise<RoomType> => {

	const createdByType = type === UserType.User ? UserType.User : UserType.Guest
	const createdBy = user?._id

	// One active room per host. Checked BEFORE the transaction so the
	// ConflictError below is not swallowed and re-wrapped by the catch block.
	const existing = await db.Rooms.findOne({
		createdBy,
		status: { $in: [SessionStatus.Waiting, SessionStatus.Running] },
	});

	if (existing) {
		// Still in the lobby -> hand the SAME room back. Makes create idempotent,
		// so a refresh or a double-tap returns the host's room instead of
		// creating a duplicate or throwing.
		if (existing.status === SessionStatus.Waiting) {
			// Revive the host's own membership in case they had left earlier.
			await db.RoomMembers.updateOne(
				{ roomId: existing._id, participantId: createdBy },
				{ isLeave: false, isOnline: true }
			);

			return {
				code: existing.code,
				_id: existing._id,
				title: existing.title,
				createdByType: existing.createdByType,
				startedAt: existing.startedAt,
				status: existing.status,
				resultMode: existing.resultMode,
			};
		}

		// A quiz is already Running -> they must end it first (via room:end).
		throw new ConflictError("You already have a quiz in progress. End it before creating a new one.");
	}

	const session = await mongoose.startSession();

	try {

		session.startTransaction()

		const code: string = await generateCode()

		const [room]: [RoomType] = await db.Rooms.create([{ title, code, createdBy, createdByType, mode, resultMode }], { session });

		if (!room) throw new InternalServerError("Failed to create room, try again later.")

		await db.RoomMembers.create([{
			roomId: room._id,
			participantType: createdByType,
			participantId: createdBy,
			role: Role.Admin
		}], { session })

		await session.commitTransaction();
		session.endSession();


		return {
			code: room.code,
			_id: room._id,
			title: room.title,
			createdByType: room.createdByType,
			startedAt: room.startedAt,
			status: room.status,
			resultMode: room.resultMode
		}
	} catch (error) {
		console.log(error)
		await session.abortTransaction();
		session.endSession();
		throw new InternalServerError("Failed to create room, try again later.")
	}

}

// End a room the host owns. Works from either Waiting (abandoned lobby) or
// Running (finished/aborted quiz). Only the creator can end it.
// NOTE: adjust `SessionStatus.Ended` to whatever your enum actually calls the
// finished state (e.g. Completed / Finished) if it differs.
export const endRoom = async (roomId: string, userId: string) => {

	const room = await db.Rooms.findOne({
		_id: roomId,
		createdBy: userId,
		status: { $in: [SessionStatus.Waiting, SessionStatus.Running] },
	});

	if (!room) throw new NotFoundError("Room not found or already ended");

	room.status = SessionStatus.Ended;
	room.endedAt = new Date();
	await room.save();

	// Mark everyone as left so the room stops showing phantom online members.
	await db.RoomMembers.updateMany(
		{ roomId, isLeave: false },
		{ isLeave: true, isOnline: false, leaveAt: new Date() }
	);

	return room;
}

export const joinRoomMember = async (code: string, user: sockertUserReq) => {

	// Players join from the lobby while the room is still `Waiting`.
	// Keep `Running` too if you want to allow late-join mid-quiz; remove it to
	// forbid joining once the quiz has started.
	const isRoomPresent = await db.Rooms.findOne({
		code: code,
		status: { $in: [SessionStatus.Waiting, SessionStatus.Running] },
		startedAt: {
			$lte: new Date()
		}
	});

	if (!isRoomPresent) throw new NotFoundError("Check the code again!!")

	const alreadyJoined = await isParticipantAlreadyJoin(isRoomPresent._id, user._id);

	if (alreadyJoined) {
		// If the member had left before, revive the membership so they reappear
		// in the list (which filters isLeave:false, isOnline:true).
		if (alreadyJoined.isLeave || !alreadyJoined.isOnline) {
			alreadyJoined.isLeave = false;
			alreadyJoined.isOnline = true;
			await alreadyJoined.save();
		}

		return {
			roomId: alreadyJoined.roomId,
			status: isRoomPresent.status,
			questionId: isRoomPresent.currentQuestionId ?? null
		};
	}

	const roomMember = await db.RoomMembers.create({
		roomId: isRoomPresent._id,
		participantType: user.type,
		participantId: user._id,
		role: Role.Member
	})

	return {
		roomId: roomMember.roomId,
		status: isRoomPresent.status,
		questionId: isRoomPresent.currentQuestionId ?? null
	};
}

export const isParticipantAlreadyJoin = async (roomId: string, participantId: string) => {

	return await db.RoomMembers.findOne({
		roomId,
		participantId,
	});

}

// Used by the `room:leave` socket event.
export const leaveRoomMember = async (roomId: string, participantId: string) => {

	await db.RoomMembers.updateOne(
		{ roomId, participantId },
		{ isLeave: true, isOnline: false, leaveAt: new Date() }
	)

}

export const getRoomMembers = async (roomId: string) => {

	const roomMemberList = await db.RoomMembers.find({
		roomId: roomId,
		isLeave: false,
		isOnline: true
	})
		.select("score role participantId participantType -_id")
		.populate({
			path: "participantId",
			select: "name -_id",
		})

	return roomMemberList

}

export const getRoomLeaderboard = async (roomId: string) => {

	const leaderboard = await db.RoomMembers.find({ roomId })
		.select("score role participantId participantType -_id")
		.sort({ score: -1 })
		.populate({
			path: "participantId",
			select: "name -_id",
		})

	return leaderboard

}

export const setMemberPresence = async (roomId: string, participantId: string, isOnline: boolean) => {

	await db.RoomMembers.updateOne(
		{ roomId, participantId, isLeave: false },
		{ isOnline }
	)

}

export const resetRoomMembersPresence = async () => {

	await db.RoomMembers.updateMany(
		{ isOnline: true },
		{ isOnline: false }
	)

}

export const roomByIdAndCreatrdBy = async (_id: string, createdBy?: string) => {
	const room = await db.Rooms.findOne({
		_id,
		createdBy
	})

	if (!room) throw new NotFoundError("Room not found");

	return room
}

export const changeStatusRoom = async (roomId: string, changeStatus: SessionStatus, whereStatus: SessionStatus, userId?: string, currentQuestionRequired?: boolean) => {
	const whereClause: any = {
		_id: roomId,
		status: whereStatus
	}
	if (userId) whereClause.createdBy = userId

	const room = await db.Rooms.findOne(whereClause)

	if (!room) throw new NotFoundError("Room not found or status is not valid");

	if (currentQuestionRequired && !room.currentQuestionId) throw new NotFoundError("Current question is not set for the room");

	room.status = changeStatus
	await room.save()

	return room;
}


export const getActiveRoomUser = async (userId: string, participantType: UserType) => {

	// Reconnect must find the member whether the room is `Waiting` (lobby) or
	// `Running` (mid-quiz), so a player who dropped during the game gets rejoined.
	const rows = await db.RoomMembers.aggregate([
		{
			$match: {
				participantId: userId,
				participantType: participantType,
				isLeave: false,
				role: Role.Admin
			}
		}, {
			$lookup: {
				from: "rooms",
				let: { roomId: "$roomId" },
				pipeline: [
					{
						$match: {
							$expr: { $eq: ["$_id", "$$roomId"] },
							status: { $in: [SessionStatus.Waiting, SessionStatus.Running] }
						}
					}
				],
				as: "room"
			}
		}, {
			$unwind: "$room"
		}
	])

	const row = rows[0]
	if (!row) return null

	// index.ts reads status/mode/currentQuestionId at the top level, but $lookup
	// nests them under `row.room`. Flatten so callers work.
	return {
		roomId: row.roomId,
		status: row.room.status,
		mode: row.room.mode,
		currentQuestionId: row.room.currentQuestionId,
	}

}