import { Socket } from "socket.io";
import { findSessionAndExpireAt } from "../services/quest.service";
import { findUserId } from "../services/user.service";
import { UserType } from "../utils/enums";
import { InternalServerError, UnauthorizedError } from "../utils/errors";
import { redisGet, redisSet } from "../utils/redis"
import { io } from "./index"

// A new connection for an identity replaces the old one (e.g. after a page
// refresh, before the server noticed the old tab is gone). The key is
// pointed at the new socket first so the old socket's disconnect handler
// can tell it was replaced and leave the new connection alone.
const claimConnection = async (key: string, socketId: string) => {
	const previousSocketId = await redisGet(key)
	await redisSet(key, socketId)
	if (previousSocketId && previousSocketId !== socketId) io.in(previousSocketId).disconnectSockets(true)
}


export const socketAuthMiddleware = async (
	socket: Socket,
	next: (err?: Error) => void
) => {
	try {
		const sessionId = socket.handshake.auth.sessionId || socket.handshake.query.sessionId;
		const userId = socket.handshake.auth.userId || socket.handshake.query.userId;
		console.log(socket.handshake.auth)
		console.log("====",userId)
		// Guest
		if (sessionId) {

			const guest = await findSessionAndExpireAt(sessionId)

			await claimConnection(`guest:${sessionId}`, socket.id)

			socket.data.user = {
				_id: guest._id,
				name: guest.name,
				sessionId: sessionId,
				type: UserType.Guest,
			};

			return next();
		}

		if (userId) {
			const user = await findUserId(userId)

			await claimConnection(`user:${userId}`, socket.id)

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