import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
}

const userSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true }
	},
	{ timestamps: true }
);

userSchema.methods.comparePassword = async function (password: string) {
	return bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model<IUser>("User", userSchema);