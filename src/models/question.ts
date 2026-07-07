import mongoose, { Schema, Document, Types } from "mongoose";
import { QuestionStatus, TypeQuestion } from "../utils/enums";

interface IOption {
  _id: Types.ObjectId;
  text: string;
}

export interface IQuestion extends Document {
  roomId: Types.ObjectId;
  order: number;
  text: string;
  type: TypeQuestion;
  options: IOption[];
  correctOptionId?: Types.ObjectId;
  points: number;
  durationSeconds: number;
  createdAt: Date;
  updatedAt: Date;
  isComplete: boolean,
  status: QuestionStatus
}

const questionSchema = new Schema<IQuestion>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Rooms",
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TypeQuestion),
      required: true,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    points: {
      type: Number,
      default: 1,
    },
    durationSeconds: {
      type: Number,
      required: true,
      default: 30,
    },
    // optional
    isComplete:{
      type: Boolean,
      required:true,
      default: false
    },
    // optional
    status:{
      type: String,
      enum: Object.values(QuestionStatus),
      default: QuestionStatus.Pending
    }
  },
  {
    timestamps: true,
  }
);

questionSchema.index(
  { roomId: 1, order: 1 },
  { unique: true }
);

export default mongoose.model<IQuestion>("Questions", questionSchema);