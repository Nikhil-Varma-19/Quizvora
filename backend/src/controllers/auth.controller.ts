import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { redisSet } from "../utils/redis";
import response from "../utils/response.helper";
import { login as loginService, registerUser, forgotPassword as forgotPasswordService, resetPassword as resetPasswordService } from "../services/user.service";


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
	const result = await loginService(email, password);
	return response.ok(res, { message: "Login successful", data: result });
};

export const logout = async (req: Request, res: Response) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (token) {
		const decoded = jwt.decode(token) as { exp?: number } | null;
		const ttl = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 0;
		if (ttl > 0) await redisSet(`blacklist:${token}`, 1, ttl);
	}
	return response.ok(res, { message: "Logout successful" });
};

export const register =async (req: Request, res: Response) => {
	const { name, email, password } = req.body;
	 const result = await registerUser({ name, email, password });
	return response.created(res, { message: "User registered successfully", data: { name: result.name, email: result.email } });
}


export const forgotPassword = async (req: Request, res: Response) => {
	await forgotPasswordService(req.body.email);
	return response.ok(res, { message: "If an account exists for this email, a password reset link has been sent" });
};

export const resetPassword = async (req: Request, res: Response) => {
	const { token, password } = req.body;
	await resetPasswordService(token, password);
	return response.ok(res, { message: "Password reset successful" });
};
