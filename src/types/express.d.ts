import { UserType } from "../utils/enums";
import { IGuestData, IUserData } from "../utils/types";

declare global {
  namespace Express {
    interface Request {
      user?: IUserData | IGuestData;
      type?: UserType;
    }
  }
}

export { };