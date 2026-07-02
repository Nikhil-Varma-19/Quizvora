import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string("Password is required").max(20, "Password must be at most 20 characters long").min(6, "Password must be at least 6 characters long")
});

export const registerSchema = z.object({
	name: z.string("Name is required").min(1, "Name is required"),
	email: z.email("Invalid email address"),
	password: z.string("Password is required").min(6, "Password must be at least 6 characters long").max(20, "Password must be at most 20 characters long"),
	confirmPassword: z.string("Confirm Password is required").min(6, "Confirm Password must be at least 6 characters long").max(20, "Confirm Password must be at most 20 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
});
