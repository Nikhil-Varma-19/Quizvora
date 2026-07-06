import { Request, Response } from "express";
import response from "../utils/response.helper";
import { createQuestion, getQuestionsByRoomId, updateQuestionById, deleteQuestionByRoomAndId, createLiveQuestion } from "../services/question.service";

export const createQuestionController = async (req: Request, res: Response) => {

	const result = await createQuestion(req.body, req.user, req.type, req.params.roomId)

	return response.created(res, { message: "Question Created Successfully" })
}

export const fetchQuestions = async (req: Request, res: Response) => {

	const result = await getQuestionsByRoomId(req.params.roomId,req.user)

	return response.ok(res,{message:"All question fetch successfully.", data:result})
}

export const updateQuestion = async (req: Request, res: Response) => {

	const {roomId, questionId} = req.params

	const result  = await updateQuestionById(roomId,questionId,req.user,req.body)

	return response.ok(res, { message: "Question updated successfully."})
}

export const deleteQuestion = async (req: Request, res: Response) => {

	const {roomId, questionId} = req.params

	const result = await deleteQuestionByRoomAndId(roomId,questionId,req.user)

	return response.ok(res, { message : "Question delete sucessfully "})
}

export const postLiveQuestion = async (req: Request, res: Response) => {

		const { roomId } = req.params

		const result = await createLiveQuestion(roomId,req.body,req.user)

		return response.created(res, { message: "Live Question Posted Successfully" })
}