import { Socket } from "socket.io"
import { io } from "./index"
import { sockertUserReq, SocketResponse } from "../utils/types"
import { socketError, socketSuccess } from "../utils/socketHelper"
import { BadRequestError, CustomError } from "../utils/errors";
import { ModePlay, SessionStatus } from "../utils/enums";
import { changeStatusRoom, getRoomLeaderboard } from "../services/room.service";
import { getCurrentQuestion, advanceQuestion } from "../services/question.service";

export default function questionSocket(socket: Socket) {

	socket.on("quiz:start", async ({ roomId }, callback: (response: SocketResponse<any>) => void) => {
		try {

			const user: sockertUserReq = socket.data.user;

			if(!roomId) throw new BadRequestError("Room Id is required")

			const room = await changeStatusRoom(roomId, SessionStatus.Running, SessionStatus.Waiting, user._id, true);

			callback(socketSuccess("Quiz started successfully", null));

			socket.to(roomId).emit("quiz:started", { message: "Quiz started successfully" , roomId: roomId.toString()});

			if(room.mode === ModePlay.predefined){

				const currentQuestion = await getCurrentQuestion(room.currentQuestionId,room._id);

				if(!currentQuestion) throw new BadRequestError("No current question found")

				io.to(roomId).emit("question:show", { message: "Current question", question : currentQuestion });
			}

		} catch (error) {
			let message = "Error while starting the quiz"
			if(error instanceof CustomError) message = error.message
			callback(socketError(message));
		}
	})

	socket.on("question:next", async ({ roomId }, callback: (response: SocketResponse<any>) => void) => {
		try {

			const user: sockertUserReq = socket.data.user;

			if(!roomId) throw new BadRequestError("Room Id is required")

			const result = await advanceQuestion(roomId, user._id);

			callback(socketSuccess(result.finished ? "Quiz finished" : "Advanced to next question", null));

			if (result.finished) {
				const leaderboard = await getRoomLeaderboard(roomId);

				io.to(roomId).emit("quiz:ended", { message: "Quiz has ended", leaderboard });
			} else {
				io.to(roomId).emit("question:show", { message: "Next question", question: result.question });
			}

		} catch (error) {
			let message = "Error while advancing the question"
			if(error instanceof CustomError) message = error.message
			callback(socketError(message));
		}
	})

}