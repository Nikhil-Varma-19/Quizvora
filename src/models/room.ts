import mongoose, { Schema, Document, Types } from "mongoose";
import { ModePlay, SessionStatus, UserType } from "../utils/enums"

export interface IRoom extends Document {
  code: string;
  title: string;
  createdBy: Types.ObjectId;
  createdByType: UserType;
  status: SessionStatus;
  currentQuestionId?: Types.ObjectId;
  startedAt?: Date;
  endedAt?: Date;
	mode: ModePlay
}

const roomSchema = new Schema<IRoom>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "createdByType",
    },
    createdByType: {
      type: String,
      enum: Object.values(UserType),
      required: true,
    },
		mode:{
			type: String,
			enum: Object.values(ModePlay),
			required: true
		},
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.Waiting,
      required: true,
    },
    currentQuestionId: {
      type: Schema.Types.ObjectId,
      ref: "Questions",
    },
    startedAt: {
      type: Date,
			default: Date.now,
    },
    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ createdBy: 1, status: 1 });

export default mongoose.model<IRoom>("Rooms", roomSchema);