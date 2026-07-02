import httpStatus from "http-status";

export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message = "Validation Error") {
    super(message, httpStatus.BAD_REQUEST);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = "Resource Not Found") {
    super(message, httpStatus.NOT_FOUND);
  }
}

export class NoDataFoundOk extends CustomError {
	constructor(message = "No Data Found") {
		super(message, httpStatus.OK);
	}
}

export class BadRequestError extends CustomError {
  constructor(message = "Bad Request") {
    super(message, httpStatus.BAD_REQUEST);
  }
}

export class ConflictError extends CustomError {
  constructor(message = "Resource Already Exists") {
    super(message, httpStatus.CONFLICT);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized") {
    super(message, httpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = "Forbidden") {
    super(message, httpStatus.FORBIDDEN);
  }
}

export class UnprocessableEntityError extends CustomError {
  constructor(message = "Unprocessable Entity") {
    super(message, httpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = "Internal Server Error") {
    super(message, httpStatus.INTERNAL_SERVER_ERROR);
  }
}