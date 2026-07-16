import { Socket } from "socket.io";
import { createRoom, joinRoomMember, getRoomMembers, setMemberPresence, leaveRoomMember, endRoom } from "../services/room.service";
import {
  RoomType,
  sockertUserReq,
  SocketResponse,
} from "../utils/types";
import { socketError, socketSuccess } from "../utils/socketHelper";
import { io } from "./index"
import { ModePlay } from "../utils/enums";
import { BadRequestError } from "../utils/errors";
import { craeteRoom } from "../validations/socket.validation";

export default function registerRoomSocket(socket: Socket) {

  socket.on(
    "room:create",
    async (
      data,
      callback: (response: SocketResponse<RoomType>) => void
    ) => {
      try {

        const { title, mode, resultMode } = craeteRoom.parse(data)

        const user: sockertUserReq = socket.data.user;

        const room = await createRoom(title, mode, resultMode, user, user.type);

        socket.join(room._id.toString());
        socket.data.activeRoomId = room._id.toString();

        const members = await getRoomMembers(room._id)

        io.to(room._id.toString()).emit(
          "player:list:update",
          members
        );

        callback(socketSuccess("Room created successfully", room));
      } catch (err: any) {
        // Log the real error so failures (code collision, validation, conflict) are diagnosable.
        console.error("room:create failed:", err);
        // Surface the actual message (e.g. the "quiz in progress" conflict) to the client.
        callback({
          success: false,
          message: err.message || "Error while creating the room",
          data: null,
        });
      }
    }
  );

  socket.on(
    "room:join",
    async (
      { code },
      callback: (response: SocketResponse<any>) => void
    ) => {
      try {
        const user: sockertUserReq = socket.data.user;

        const room = await joinRoomMember(code, user);

        socket.join(room.roomId.toString());
        socket.data.activeRoomId = room.roomId.toString();
        await setMemberPresence(room.roomId, user._id, true);

        const members = await getRoomMembers(room.roomId)

        io.to(room.roomId.toString()).emit(
          "player:list:update",
          members
        );

        callback({
          success: true,
          message: "Joined room successfully",
          data: room,
        });
      } catch (err: any) {
        console.error("room:join failed:", err);
        callback({
          success: false,
          message: err.message,
          data: null,
        });
      }
    }
  );

  // Voluntary leave. Sets isLeave, leaves the socket room, and broadcasts the
  // new list so everyone else updates immediately (no 20s grace wait).
  socket.on(
    "room:leave",
    async (
      _data,
      callback: (response: SocketResponse<any>) => void
    ) => {
      try {
        const user: sockertUserReq = socket.data.user;
        const roomId = socket.data.activeRoomId;

        if (!roomId) {
          return callback(socketError("You are not in a room"));
        }

        await leaveRoomMember(roomId, user._id);

        socket.leave(roomId);
        socket.data.activeRoomId = undefined;

        const members = await getRoomMembers(roomId)

        io.to(roomId).emit(
          "player:list:update",
          members
        );

        callback(socketSuccess("Left room successfully", null));
      } catch (err: any) {
        console.error("room:leave failed:", err);
        callback({
          success: false,
          message: err.message,
          data: null,
        });
      }
    }
  );

  // Host ends the room (abandoned lobby or finished quiz). endRoom() verifies
  // the caller is the creator, so a non-host call is rejected inside the service.
  socket.on(
    "room:end",
    async (
      data,
      callback: (response: SocketResponse<any>) => void
    ) => {
      try {
        const user: sockertUserReq = socket.data.user;
        const roomId = (data && data.roomId) || socket.data.activeRoomId;

        if (!roomId) {
          return callback(socketError("No room to end"));
        }

        await endRoom(roomId, user._id);

        // Notify everyone the room is over.
        io.to(roomId).emit("room:ended", {
          message: "Room ended by host",
          roomId,
        });

        // Detach every socket from the room and clear their active room id.
        const socketsInRoom = await io.in(roomId).fetchSockets();
        for (const s of socketsInRoom) {
          s.data.activeRoomId = undefined;
          s.leave(roomId);
        }

        callback(socketSuccess("Room ended successfully", null));
      } catch (err: any) {
        console.error("room:end failed:", err);
        callback({
          success: false,
          message: err.message,
          data: null,
        });
      }
    }
  );
}