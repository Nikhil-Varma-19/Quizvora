import { Request, Response } from "express";
import response from "../utils/response.helper";
import { login as loginService, registerUser } from "../services/user.service";


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
	const result = await loginService(email, password);
	return response.ok(res, { message: "Login successful", data: result });
};

export const register = async (req: Request, res: Response) => {
	const { name, email, password } = req.body;
	 const result = await registerUser({ name, email, password });
	return response.created(res, { message: "User registered successfully", data: { name: result.name, email: result.email } });
}
