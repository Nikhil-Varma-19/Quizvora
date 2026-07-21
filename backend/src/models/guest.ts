import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  sessionId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const guestsSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("Guest", guestsSchema);