import mongoose from "mongoose";
const db = require('../models/index');
import { sockertUserReq } from "../utils/types";
import { Role, SessionStatus, TypeQuestion } from "../utils/enums";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";

const ANSWER_GRACE_MS = 2000;

export const submitAnswer = async (
	roomId: string,
	questionId: string,
	user: sockertUserReq,
	optionId?: string,
	writtenAnswer?: string
) => {

	const room = await db.Rooms.findOne({ _id: roomId, status: SessionStatus.Running });

	if (!room) throw new NotFoundError("Room not found or quiz is not running");

	if (room.currentQuestionId?.toString() !== questionId) {
		throw new BadRequestError("This question is not currently active");
	}

	const isMember = await db.RoomMembers.findOne({ roomId, participantId: user._id, isLeave: false });

	if (!isMember) throw new NotFoundError("You are not a member of this room");

	const question = await db.Questions.findOne({ _id: questionId, roomId });

	if (!question) throw new NotFoundError("Question not found");

	// Answers are only accepted within the question's time limit (small grace for network lag).
	if (question.startedAt && question.durationSeconds > 0) {
		const deadline = new Date(question.startedAt).getTime() + question.durationSeconds * 1000 + ANSWER_GRACE_MS;
		if (Date.now() > deadline) throw new BadRequestError("Time is up for this question");
	}

	const alreadyAnswered = await db.Answers.findOne({ questionId, participantId: user._id });

	if (alreadyAnswered) throw new ConflictError("You have already answered this question");

	let isCorrect = false;

	if (question.type === TypeQuestion.Mcq) {
		if (!optionId) throw new BadRequestError("Option is required for this question");

		const option = question.options.find((opt: any) => opt._id.toString() === optionId);

		if (!option) throw new BadRequestError("Invalid option");

		isCorrect = option.isCorrect;
	}

	const pointsAwarded = isCorrect ? question.points : 0;

	const answer = await db.Answers.create({
		roomId,
		questionId,
		participantId: user._id,
		participantType: user.type,
		selectedOptionId: optionId,
		writtenAnswer,
		isCorrect,
		pointsAwarded,
	});

	if (pointsAwarded > 0) {
		await db.RoomMembers.updateOne(
			{ roomId, participantId: user._id },
			{ $inc: { score: pointsAwarded } }
		);
	}

	return {
		answer,
		isCorrect,
		pointsAwarded,
		resultMode: room.resultMode,
		questionType: question.type,
		adminId: room.createdBy.toString(),
		adminType: room.createdByType,
	};

}

// Called when a question is finished: every player who did not answer gets a
// timed-out record worth 0 points, so the leaderboard can show it.
export const closeQuestion = async (roomId: any, questionId: any) => {

	const members = await db.RoomMembers.find({ roomId, role: Role.Member, isLeave: false }).select("participantId participantType");

	if (members.length === 0) return;

	const answered = await db.Answers.find({ questionId }).select("participantId");

	const answeredIds = new Set(answered.map((a: any) => a.participantId.toString()));

	const missing = members.filter((m: any) => !answeredIds.has(m.participantId.toString()));

	if (missing.length === 0) return;

	await db.Answers.insertMany(
		missing.map((m: any) => ({
			roomId,
			questionId,
			participantId: m.participantId,
			participantType: m.participantType,
			isCorrect: false,
			pointsAwarded: 0,
			isTimedOut: true,
		})),
		{ ordered: false }
	).catch(() => { /* a late real answer may already hold the slot */ });

}

export const getMcqStats = async (questionId: string) => {

	const question = await db.Questions.findOne({ _id: questionId }).select("options");

	if (!question) throw new NotFoundError("Question not found");

	const counts = await db.Answers.aggregate([
		{ $match: { questionId: new mongoose.Types.ObjectId(questionId), isTimedOut: { $ne: true } } },
		{ $group: { _id: "$selectedOptionId", count: { $sum: 1 } } }
	]);

	const totalAnswers = counts.reduce((sum: number, c: any) => sum + c.count, 0);

	const options = question.options.map((opt: any) => {
		const match = counts.find((c: any) => c._id?.toString() === opt._id.toString());
		const count = match ? match.count : 0;

		return {
			optionId: opt._id,
			text: opt.text,
			count,
			percentage: totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0,
		};
	});

	return { totalAnswers, options };

}

export const getWrittenAnswers = async (questionId: string) => {

	const answers = await db.Answers.find({ questionId, isTimedOut: { $ne: true } })
		.select("participantId writtenAnswer submittedAt -_id")
		.populate({
			path: "participantId",
			select: "name -_id",
		})

	return answers;

}
