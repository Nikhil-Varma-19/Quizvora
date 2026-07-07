import { Socket } from "socket.io"
import { sockertUserReq } from "../utils/types";
import { CustomError } from "../utils/errors";
import { socketError } from "../utils/socketHelper";
import { answerSchema } from "../validations/answer.validation";
export default function answerSocket(socket: Socket) {

	socket.on("answer:submit", async (data, callback) => {
		try {
			const user: sockertUserReq = socket.data.user;

			const body = answerSchema.parse(data);

			




		} catch (error) {
			let message = "Error while submitting the answer"
			if (error instanceof CustomError) message = error.message
			callback(socketError(message));
		}
	})

}