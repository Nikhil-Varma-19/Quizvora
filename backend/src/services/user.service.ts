const db = require('../models/index');
import  { NotFoundError, ConflictError, InternalServerError, BadRequestError }  from '../utils/errors';
import { registerUserType } from '../utils/types';
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { sendMail } from "../utils/mailer"

const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const login = async (email: string, password: string) => {

	const user = await db.User.findOne({ email });

	if (!user) {
		throw new NotFoundError('Invalid email or password');
	}

	const isMatch = await user.comparePassword(password);

	if (!isMatch) {
		throw new NotFoundError('Invalid email or password');
	}

	const payLoad = {
		userId : user._id,
	}

	const secretKey  = process.env.JWT_KEY

	const expiresDay = Number(process.env.JWT_EXPIRE_DAY)

	if(!secretKey || !expiresDay) throw new InternalServerError()

	const token = jwt.sign(payLoad, secretKey,{
     expiresIn : expiresDay 
	})

	return {
		token:token,
		email:user.email,
		userId:user._id,
		name: user.name
	}
}

export const registerUser = async (registerData : registerUserType) => {
	const { name, email, password } = registerData;

	const existingUser = await db.User.findOne({ email });
	
	if (existingUser) {
		throw new ConflictError('Email already exists');
	}

	const user = await db.User.create({ name, email, password });
	
	return { name: user.name, email: user.email };
}

export const findUserId = async(userId:string) => {

	const user = await db.User.findById(userId).select("-password");

	if(!user) throw new NotFoundError()

	return user;

}



export const forgotPassword = async (email: string) => {
	const user = await db.User.findOne({ email });
	if (!user) return;

	const token = crypto.randomBytes(32).toString("hex");
	user.resetPasswordToken = hashToken(token);
	user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
	await user.save();

	const frontendUrl = process.env.FRONTEND_URL;
	if (!frontendUrl) throw new InternalServerError();
	const link = `${frontendUrl}/reset-password?token=${token}`;

	try {
		await sendMail({
			to: user.email,
			subject: "Reset your Quizvora password",
			html: `<p>Hi ${user.name},</p>
<p>We received a request to reset your password. Click the link below to choose a new one. This link expires in 10 minutes.</p>
<p><a href="${link}">Reset password</a></p>
<p>If you didn't request this, you can ignore this email.</p>`,
		});
	} catch {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();
		throw new InternalServerError("Could not send reset email");
	}
};

export const resetPassword = async (token: string, password: string) => {
	const user = await db.User.findOne({
		resetPasswordToken: hashToken(token),
		resetPasswordExpires: { $gt: new Date() },
	}).select("+resetPasswordToken +resetPasswordExpires");

	if (!user) throw new BadRequestError("Reset link is invalid or has expired");

	user.password = password; // hashed by the pre-save hook
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	await user.save();
};
