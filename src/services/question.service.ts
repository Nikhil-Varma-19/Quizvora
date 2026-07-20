const db = require('../models/index');
import { IGuestData, IUserData } from "../utils/types";
import { NotFoundError, BadRequestError, InternalServerError, ConflictError } from "../utils/errors";
import { ModePlay, QuestionStatus, Role, SessionStatus, TypeQuestion, UserType } from "../utils/enums";
import { roomByIdAndCreatrdBy } from "./room.service";

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

	const questionTexts = body.questions.map((q: any) => q.question.trim())

	const existingQuestion = await db.Questions.find({
		roomId,
		text: { $in: questionTexts },
	}).select("text");

	if (existingQuestion.length > 0) {
		throw new BadRequestError(`Duplicate question found: ${existingQuestion.map((q: any) => q.text).join(", ")} `)
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

	const firstQuestion = result.find((q: any) => q.order === 1);

	await db.Rooms.updateOne({ _id: roomId }, { $set: { currentQuestionId: firstQuestion._id } });

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

export const createLiveQuestion = async (roomId: any, body: any, user: IUserData | undefined | IGuestData) => {

	const room = await roomByIdAndCreatrdBy(roomId, user?._id.toString())

	if (room.status !== SessionStatus.Running) throw new BadRequestError("Check the room status first.")

	const questionCount = await db.Questions.countDocuments({ roomId: roomId })

	if (questionCount !== room.currentQuestionId) throw new ConflictError("Cannot post live question.")

	const bodydata = {
		roomId: roomId,
		order: questionCount + 1,
		text: body.question,
		type: body.type,
		options: body.options,
		durationSeconds: body.durationSeconds || 30,
		points: body.points || 1,
	}

	const result = await db.Questions.create(bodydata)

	return result;

}

export const getCurrentQuestion = async (_id?: string, roomId?: string, order?: number) => {

	const whereClause: any = {}

	if (_id) whereClause._id = _id

	if (roomId) whereClause.roomId = roomId

	if (order) whereClause.order = order

	const question = await db.Questions.findOne(whereClause).sort({ order: 1 }).select("order text type point durationSeconds options isComplete status").lean();

	if (question) {
		question.options = question.options?.map(({ isCorrect, ...option }: any) => option);
	}

	return question;

}


// Admin-driven advance to the next predefined question. `live` mode questions
// are authored one at a time via createLiveQuestion, so running out of a next
// question there just means the admin hasn't created one yet - not the end of
// the quiz. For `predefined` mode, every question is authored upfront, so
// running out means the quiz is actually finished.
export const advanceQuestion = async (roomId: string, userId: string) => {

	const room = await db.Rooms.findOne({ _id: roomId, createdBy: userId, status: SessionStatus.Running });

	if (!room) throw new NotFoundError("Room not found or quiz is not running");

	const currentQuestion = await db.Questions.findOne({ _id: room.currentQuestionId, roomId });

	if (!currentQuestion) throw new NotFoundError("Current question not found");

	const nextQuestion = await db.Questions.findOne({ roomId, order: currentQuestion.order + 1 });

	if (!nextQuestion) {
		if (room.mode !== ModePlay.predefined) throw new BadRequestError("No next question created yet");

		room.status = SessionStatus.Ended;
		room.endedAt = new Date();
		await room.save();

		return { finished: true };
	}

	room.currentQuestionId = nextQuestion._id;
	await room.save();

	return { finished: false, question: nextQuestion };

}

export const getRoomCurrentQuestion = async (roomId: string, questionId: string) => {

	const question = await db.Room.findOne({
		currecurrentQuestionId: questionId,
		_id: roomId,
	})

	if(!question) throw new BadRequestError("Question not found");

	return true;
}