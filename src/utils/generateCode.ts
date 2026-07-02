import { findGuestBySessionId } from "../services/quest.service";
import { isCodeExists } from "../services/room.service";
import crypto from "crypto";

const alphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const generateCode = async (length: number = 8): Promise<string> => {
  let code = "";
  let exists = true;

  while (exists) {
    code = "";

    for (let i = 0; i < length; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    exists = await isCodeExists(code);
  }

  return code;
};

export const generateSessionCode = async () => {
  let sessionId = "" 
  let exists = true;

  while(exists){
    sessionId = crypto.randomBytes(16).toString("hex");

    const guest = await findGuestBySessionId(sessionId);

    if(!guest) exists = false
  }

  return sessionId;
} 