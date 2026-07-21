import { Socket } from "socket.io"
import { io } from "./index"
import { sockertUserReq, SocketResponse } from "../utils/types";
import { CustomError } from "../utils/errors";
import { socketError, socketSuccess } from "../utils/socketHelper";
import { answerSchema } from "../validations/answer.validation";
import { submitAnswer, getMcqStats, getWrittenAnswers } from "../services/answer.service";
import { redisGet } from "../utils/redis";
import { ResultMode, TypeQuestion, UserType } from "../utils/enums";

export default function answerSocket(socket: Socket) {

	socket.on("answer:submit", async (data, callback: (response: SocketResponse<any>) => void) => {
		try {
			const user: sockertUserReq = socket.data.user;

			const body = answerSchema.parse(data);

			const { isCorrect, pointsAwarded, resultMode, questionType, adminId, adminType } = await submitAnswer(
				body.roomId,
				body.questionId,
				user,
				body.optionId,
				body.answer
			);

			callback(socketSuccess("Answer submitted successfully", { isCorrect, pointsAwarded }));

			socket.to(body.roomId).emit("answer:submitted", {
				participantId: user._id,
				questionId: body.questionId,
			});

			// "perQuestion" mode surfaces stats live as each answer comes in.
			// "atLast" mode stays silent until question:next reveals the final leaderboard.
			if (resultMode === ResultMode.PerQuestion) {
				if (questionType === TypeQuestion.Mcq) {
					const stats = await getMcqStats(body.questionId);

					socket.emit("question:stats", {
						questionId: body.questionId,
						type: TypeQuestion.Mcq,
						...stats,
					});
				} else {
					const answers = await getWrittenAnswers(body.questionId);

					// Written answers are for the admin's eyes only, not broadcast to the room.
					const adminSocketId = await redisGet(`${adminType === UserType.Guest ? "guest" : "user"}:${adminId}`);

					if (adminSocketId) {
						io.to(adminSocketId).emit("question:stats", {
							questionId: body.questionId,
							type: TypeQuestion.Written,
							answers,
						});
					}
				}
			}

		} catch (error) {
			let message = "Error while submitting the answer"
			if (error instanceof CustomError) message = error.message
			callback(socketError(message));
		}
	})

}