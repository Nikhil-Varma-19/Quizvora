import mongoose, { Schema, Document, Types } from "mongoose";
import { Role, UserType } from "../utils/enums";

export interface IRoomMember extends Document {
  roomId: Types.ObjectId;
  participantId: Types.ObjectId;
  participantType: UserType;
  role: Role;
  score: number;
  joinedAt: Date;
  isLeave: boolean;
  leaveAt: Date;
  isOnline: boolean;
}

const roomMemberSchema = new Schema<IRoomMember>({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Rooms",
    required: true,
  },
  participantId: {
    type: Schema.Types.ObjectId,
    refPath: 'participantType',
    required: true,
  },
  participantType: {
    type: String,
    enum: Object.values(UserType),
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.Member,
  },
  score: {
    type: Number,
    default: 0,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  isLeave:{
    type: Boolean,
    default:false
  },
  leaveAt:{
    type:Date,
  },
  isOnline: {
    type: Boolean,
    default: true,
  }
});

roomMemberSchema.index(
  { roomId: 1, participantId: 1 },
  { unique: true }
);

roomMemberSchema.index({
  roomId: 1,
  score: -1,
});

roomMemberSchema.index({
  participantId: 1,
});

export default mongoose.model<IRoomMember>("RoomMembers", roomMemberSchema);