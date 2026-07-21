import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import registerRoomSocket from "./room.socket";
import { socketAuthMiddleware } from "./middleware";
import { redisSet, redisDeleteKey } from "../utils/redis";
import { SessionStatus, UserType } from "../utils/enums";
import questionSocket from "./question.socket";
import answerSocket from "./answer.socket";
import { getActiveRoomUser, getRoomMembers, setMemberPresence, resetRoomMembersPresence } from "../services/room.service";
import { getCurrentQuestion } from "../services/question.service";

export let io: Server;

const OFFLINE_GRACE_MS = 20000;
const pendingOffline = new Map<string, NodeJS.Timeout>();

export const initializeSocket = (server: HttpServer) => {
	io = new Server(server, {
		cors: {
			origin: "*",
			credentials: true,
		},
	});

	io.use(socketAuthMiddleware);

	resetRoomMembersPresence().catch((err) => console.error("Failed to reset room member presence:", err));

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
				redisSet(`guest:${user.sessionId}`, socket.id)
			} else {
				redisSet(`user:${user._id}`, socket.id);
			}

			// register events
			registerRoomSocket(socket);
			questionSocket(socket);
			answerSocket(socket);

			const presenceKey = `${user.type}:${user._id}`;

			const pendingTimer = pendingOffline.get(presenceKey);
			if (pendingTimer) {
				clearTimeout(pendingTimer);
				pendingOffline.delete(presenceKey);
			}

			const activeRoom = await getActiveRoomUser(user._id, user.type)

			if (activeRoom) {
				socket.join(activeRoom.roomId.toString());
				socket.data.activeRoomId = activeRoom.roomId.toString();

				await setMemberPresence(activeRoom.roomId, user._id, true);

				const members = await getRoomMembers(activeRoom.roomId)

				io.to(activeRoom.roomId.toString()).emit("player:list:update", members);

				if (activeRoom.status === SessionStatus.Running) {
					socket.emit("quiz:started", { message: "Quiz started successfully", roomId: activeRoom.roomId.toString() });

					const currentQuestion = await getCurrentQuestion(activeRoom.currentQuestionId, activeRoom.roomId);

					if (currentQuestion) {
						socket.emit("question:show", { message: "Current question", question: currentQuestion });
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

				if (user.type === UserType.Guest) {
					redisDeleteKey(`guest:${user.sessionId}`)
				} else {
					redisDeleteKey(`user:${user._id}`)
				}

				const roomId = socket.data.activeRoomId;

				if (roomId) {
					const timer = setTimeout(async () => {
						pendingOffline.delete(presenceKey);
						try {
							await setMemberPresence(roomId, user._id, false);
							const members = await getRoomMembers(roomId);
							io.to(roomId).emit("player:list:update", members);
						} catch (err) {
							console.error("Failed to mark member offline:", err);
						}
					}, OFFLINE_GRACE_MS);

					pendingOffline.set(presenceKey, timer);
				}
			});
		} catch (err) {
			console.error("Connection handler error:", err);
			socket.disconnect(true);
		}
	});
};