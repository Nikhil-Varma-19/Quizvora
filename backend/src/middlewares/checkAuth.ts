import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, InternalServerError } from "../utils/errors";
import jwt from "jsonwebtoken";
import { findUserId } from "../services/user.service";
import { IdecodeToken, IUserData } from "../utils/types";
import { openUrl, sessionRequired } from "../utils/openURL";
import { findSessionAndExpireAt } from "../services/quest.service";
import { UserType } from "../utils/enums";
import { isMatch, isRouteMatch } from "../utils/matcher";


const openUrlSet = new Set(openUrl);
const sessionUrlSet = new Set(sessionRequired)

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      if (openUrlSet.has(req.originalUrl)) {
        return next()
      }

      const sessionId: any = req.headers["session-id"]

      if (!sessionId) return next(new InternalServerError())

      const guest = await findSessionAndExpireAt(sessionId)

      req.user = guest;
      req.type = UserType.Guest

      return next()

    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new UnauthorizedError("Please login first"));
    }

    const secretKey = process.env.JWT_KEY;

    if (!secretKey) {
      return next(new InternalServerError());
    }

    const decoded = jwt.verify(token, secretKey) as IdecodeToken;

    const user: IUserData = await findUserId(decoded.userId);

    if (!user) {
      return next(new UnauthorizedError("User not found"));
    }

    req.user = user;
    req.type = UserType.User

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError("Token has expired. Please login again."));
    }

    console.log("Auth Error:", error);
    return next(new UnauthorizedError("Authentication failed"));
  }
};

export default auth;