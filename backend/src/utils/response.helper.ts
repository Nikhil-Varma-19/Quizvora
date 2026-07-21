import { Response } from "express";
import httpStatus from "http-status";

type ApiOptions = {
  message?: string;
  data?: any;
  error?: string;
};

const response = {
  ok: (res: Response, options: ApiOptions = { message: "data found" }) => {
    return res.status(httpStatus.OK).json({
      // statusCode: httpStatus.OK,
      ...options
    });
  },

  created: (res: Response, options: ApiOptions = { message: "data inserted" }) => {
    return res.status(httpStatus.CREATED).json({
      // statusCode: httpStatus.CREATED,
      ...options
    });
  },

  badRequest: (res: Response, options: ApiOptions = { error: "bad request" }) => {
    return res.status(httpStatus.BAD_REQUEST).json({
      // statusCode: httpStatus.BAD_REQUEST,
      ...options
    });
  },

  noData: (res: Response, options: ApiOptions = { error: "no data found" }) => {
    return res.status(httpStatus.NOT_FOUND).json({
      // statusCode: httpStatus.NOT_FOUND,
      ...options
    });
  },

  noContent: (res: Response, options: ApiOptions = { error: "no content" }) => {
    return res.status(httpStatus.NO_CONTENT).send();
  },

  unauthorized: (res: Response, options: ApiOptions = { error: "unauthorized" }) => {
    return res.status(httpStatus.UNAUTHORIZED).json({
      // statusCode: httpStatus.UNAUTHORIZED,
      ...options
    });
  },

  forbidden: (res: Response, options: ApiOptions = { error: "forbidden" }) => {
    return res.status(httpStatus.FORBIDDEN).json({
      // statusCode: httpStatus.FORBIDDEN,
      ...options
    });
  },

  unprocessableEntity: (res: Response, options: ApiOptions = { error: "unprocessable entity" }) => {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
      //  statusCode: httpStatus.UNPROCESSABLE_ENTITY,
      ...options
    });
  }
};

export default response;