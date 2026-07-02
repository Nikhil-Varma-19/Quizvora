import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import registerRoomSocket from "./room.socket";
import { socketAuthMiddleware } from "./middleware";
import { socketGuestMap, socketUserMap } from "../utils/redis";
import { UserType } from "../utils/enums";

export let io: Server;

export const initializeSocket = (server: HttpServer) => {
	io = new Server(server, {
		cors: {
			origin: "*",
			credentials: true,
		},
	});

	io.use(socketAuthMiddleware);

	io.on("connection", (socket) => {
		try {
			console.log(`Socket Connected: ${socket.id}`);

			const user = socket.data?.user;
			
			if (!user || !user.sessionId) {
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