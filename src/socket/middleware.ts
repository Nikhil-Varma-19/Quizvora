import { Socket } from "socket.io";
import { findSessionAndExpireAt } from "../services/quest.service";
import { findUserId } from "../services/user.service";
import { UserType } from "../utils/enums";
import { InternalServerError, UnauthorizedError } from "../utils/errors";
import { socketGuestMap, socketUserMap } from "../utils/redis"
import moment from "moment";

export const socketAuthMiddleware = async (
	socket: Socket,
	next: (err?: Error) => void
) => {
	try {
		const sessionId = socket.handshake.auth.sessionId || socket.handshake.query.sessionId;
		const userId = socket.handshake.auth.userId || socket.handshake.query.userId;

		// Guest
		if (sessionId) {

			if (socketGuestMap.has(sessionId))  return next(new InternalServerError("Already connection is there."))


			const guest = await findSessionAndExpireAt(sessionId)

			socket.data.user = {
				_id: guest._id,
				name: guest.name,
				sessionId: sessionId,
				type: UserType.Guest,
			};

			return next();
		}

		if (userId) {
			if (socketUserMap.has(userId)) return next(new InternalServerError("Already connection is there."))

			const user = await findUserId(userId)

			socket.data.user = {
				_id: user._id,
				name: user.name,
				email: user.email,
				type: UserType.User,
			};

			return next();
		}

		return next(new UnauthorizedError());
	} catch (error) {
		console.log("Error Socket", error)
		return next(new UnauthorizedError("Authentication failed"));
	}
};