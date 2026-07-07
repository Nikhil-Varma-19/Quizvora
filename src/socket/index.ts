import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import registerRoomSocket from "./room.socket";
import { socketAuthMiddleware } from "./middleware";
import { socketGuestMap, socketUserMap } from "../utils/redis";
import { SessionStatus, UserType } from "../utils/enums";
import questionSocket from "./question.socket";
import { getActiveRoomUser, getRoomMembers } from "../services/room.service";
import { getCurrentQuestion } from "../services/question.service";

export let io: Server;

export const initializeSocket = (server: HttpServer) => {
	io = new Server(server, {
		cors: {
			origin: "*",
			credentials: true,
		},
	});

	io.use(socketAuthMiddleware);

	io.on("connection", async (socket) => {
		try {
			console.log(`Socket Connected: ${socket.id}`);

			const user = socket.data?.user;

			if (!user) {
				console.error("Invalid socket user, disconnecting:", socket.id);
				socket.disconnect(true);
				return;
			}
			if (user.type === UserType.Guest) {
				socketGuestMap.set(user.sessionId, socket.id);
			} else {
				socketUserMap.set(user.sessionId, socket.id);
			}

			// register events 
			registerRoomSocket(socket);
			questionSocket(socket);


			const activeRoom = await getActiveRoomUser(user._id, user.type)

			if (activeRoom) {
				socket.join(activeRoom.roomId.toString());

				const members = await getRoomMembers(activeRoom.roomId)

				socket.emit("player:list:update", members);

				if (activeRoom.status === SessionStatus.Running) {
					socket.to(activeRoom.roomId.toString()).emit("quiz:started", { message: "Quiz started successfully", roomId: activeRoom.roomId.toString() });

					const currentQuestion = await getCurrentQuestion(activeRoom.mode, activeRoom.currentQuestionId);

					if (currentQuestion) {
						socket.to(activeRoom.roomId.toString()).emit("question:show", { message: "Current question", question: currentQuestion });
					}
				}
			}

			// 🧠 socket-level error handler
			socket.on("error", (err) => {
				console.error(`Socket error (${socket.id}):`, err);
			});

			// disconnect cleanup
			socket.on("disconnect", (reason) => {
				console.log(`Socket Disconnected: ${socket.id}, reason: ${reason}`);

				if (!user?.sessionId) return;

				if (user.type === UserType.Guest) {
					socketGuestMap.delete(user.sessionId);
				} else {
					socketUserMap.delete(user.sessionId);
				}
			});
		} catch (err) {
			console.error("Connection handler error:", err);
			socket.disconnect(true);
		}
	});
};