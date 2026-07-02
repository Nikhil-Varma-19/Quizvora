import moment, { Moment } from "moment";
import { InternalServerError, NotFoundError } from "../utils/errors";
import { generateSessionCode } from "../utils/generateCode";

const db = require('../models/index');

export const findGuestBySessionId = async (sessionId: string) => await db.Guest.findOne({ sessionId })

export const findSessionAndExpireAt = async (sessionId: string, expiresAt: Date | Moment = moment().add(6, "hours")) => {

	const guest = await db.Guest.findOne({
		sessionId,
		expiresAt: { $gt: expiresAt },
	});

	if (!guest) throw new NotFoundError("Try Again.")

	return guest
}

export const createGuest = async (name: string) => {

	const sessionId = await  generateSessionCode()

	const guest = await db.Guest.create({ name, sessionId });

	if (!guest) throw new InternalServerError()

	return guest

}


