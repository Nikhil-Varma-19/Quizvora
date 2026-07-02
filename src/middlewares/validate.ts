import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema, target: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0].message,
      });
    }

    // replace with parsed (optional but good practice)
    req[target] = result.data;

    next();
  };