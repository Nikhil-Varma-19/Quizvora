import mongoose, { Schema, Document, Types } from "mongoose";
import { UserType } from "../utils/enums";

export interface IAnswer extends Document {
  roomId: Types.ObjectId;
  questionId: Types.ObjectId;
  participantId: Types.ObjectId;
  participantType: UserType;
  selectedOptionId?: Types.ObjectId;
  writtenAnswer?: string;
  isCorrect: boolean;
  pointsAwarded: number;
  submittedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Rooms",
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Questions",
      required: true,
    },
    participantId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    participantType: {
      type: String,
      enum: Object.values(UserType),
      required: true,
    },
    selectedOptionId: {
      type: Schema.Types.ObjectId,
    },
    writtenAnswer: {
      type: String,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

answerSchema.index(
  {
    questionId: 1,
    participantId: 1,
  },
  {
    unique: true,
  }
);

answerSchema.index({
  roomId: 1,
  questionId: 1,
});

answerSchema.index({
  participantId: 1,
});

export default mongoose.model<IAnswer>("Answers", answerSchema);