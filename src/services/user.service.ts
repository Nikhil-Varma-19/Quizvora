const db = require('../models/index');
import  { NotFoundError, ConflictError, InternalServerError}  from '../utils/errors';
import { registerUserType } from '../utils/types';
import jwt from "jsonwebtoken"

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
		userId:user._id
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

