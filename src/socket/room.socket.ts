import { Socket } from "socket.io";
import { createRoom, joinRoomMember, getRoomMembers } from "../services/room.service";
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

        const { title, mode } = craeteRoom.parse(data)

        const user: sockertUserReq = socket.data.user;

        // if(!title.trim() || !Object.values(ModePlay).includes(mode as ModePlay)){
        //     throw new BadRequestError()
        // }

        const room = await createRoom(title,mode, user, user.type);

        socket.join(room._id.toString());

        callback(socketSuccess("Room created successfully", room));
      } catch (err: any) {
        callback(socketError("Error while creating the room"));
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
        callback({
          success: false,
          message: err.message,
          data: null,
        });
      }
    }
  );
}