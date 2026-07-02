const db = require('../models/index');
import { ModePlay, QuestionStatus, Role, SessionStatus, TypeQuestion, UserType } from "../utils/enums";
import { NotFoundError, BadRequestError, InternalServerError } from "../utils/errors";
import { IGuestData, IUserData } from "../utils/types";

export const createQuestion = async (body: any, user: IUserData | undefined | IGuestData, type: UserType | undefined, roomId: any) => {

	const userId = user?._id.toString();

	const roomDetail = await db.RoomMembers.findOne({
		participantId: userId,
		roomId: roomId,
		role: Role.Admin
	}).populate({
		path: 'roomId',
		select: "currentQuestionId status mode"
	});

	if (!roomDetail) throw new NotFoundError("Room Detail not found.");

	if (roomDetail.roomId.status !== SessionStatus.Waiting || roomDetail.roomId.mode !== ModePlay.predefined) {
		throw new NotFoundError("Room is not in waiting state or not in predefined mode.");
	};

	const questionTexts  = body.questions.map((q : any) => q.question.trim())

	const existingQuestion = await db.Questions.find({
		roomId,
  text: { $in: questionTexts },
	}).select("text");

	if(existingQuestion.length > 0){
		throw new BadRequestError(`Duplicate question found: ${existingQuestion.map((q:any) => q.text).join(", ")} `)
	}

	const questions = body.questions.map((item: any, indx: number) => {
		const res: any = {
			roomId: roomId,
			order: indx + 1,
			text: item.question,
			type: item.type,
		}

		if (body.questionDurationSeconds > 0) {
			res.durationSeconds = body.questionDurationSeconds;
		}
		if (item.type === TypeQuestion.Mcq) {
			res.options = item.options.map((option: any) => {
				return {
					text: option.text,
					isCorrect: option.isCorrect || false
				}
			})
		}

		return res;
	})

	const result = await db.Questions.insertMany(questions);

	return result;
}

export const getQuestionsByRoomId = async (roomId: any, user: IUserData | undefined | IGuestData) => {
	const room = await db.Rooms.findOne({
		_id: roomId,
		createdBy: user?._id.toString()
	})
	if (!room) throw new NotFoundError("Room not found");

	const questions = await db.Questions.find({ roomId: roomId }).sort({ order: 1 }).select("order text type point durationSeconds options isComplete status");

	return questions;
}

export const updateQuestionById = async (roomId: any, questionId: any, user: IUserData | undefined | IGuestData, body: any) => {
	const room = await db.Rooms.findOne({
		_id: roomId,
		createdBy: user?._id.toString()
	})

	if (!room) throw new NotFoundError("Room not found");

	if (room.status === SessionStatus.Ended) throw new BadRequestError("Cannot change the question.")

	body.text = body.question;
	delete body.question

	const whereClause = { _id: questionId, roomId: roomId, status: QuestionStatus.Pending }

	const updateQuestion = await db.Questions.updateOne(whereClause, { $set: body })

	if (updateQuestion.modifiedCount == 0) throw new InternalServerError()

	return updateQuestion;

}

export const deleteQuestionByRoomAndId = async (roomId: any, questionId: any, user: IUserData | undefined | IGuestData) => {

	const room = await db.Rooms.findOne({
		_id: roomId,
		createdBy: user?._id.toString()
	})

	if (!room) throw new NotFoundError("Room not found");

	if (room.status === SessionStatus.Ended) throw new BadRequestError("Cannot delete the question.")

	const whereClause = { _id: questionId, roomId: roomId, status: QuestionStatus.Pending };

	const deleteQuestion = await db.Questions.deleteOne(whereClause);

	if (deleteQuestion.deletedCount !== 1) throw new InternalServerError();

	return deleteQuestion
}