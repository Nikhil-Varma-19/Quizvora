import express from "express";
import { validate } from "../middlewares/validate";
import { createRoomValidation } from "../validations/room.validation";
import { createRoomController } from "../controllers/room.controller";
import { errorWrapper } from "../middlewares/errorWrapper";
import checkAuth from "../middlewares/checkAuth"
const router = express.Router();

router.post("/create",checkAuth,validate(createRoomValidation),errorWrapper(createRoomController))

export default router;