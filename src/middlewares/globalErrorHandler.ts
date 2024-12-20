import { HttpError } from "http-errors";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import logger from "../config/logger";

export const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
) => {
  const errorId = uuidv4();
  const statusCode = err.status || 500;

  const isProduction = process.env.NODE_ENV === "production";
  const message = isProduction ? "Internal Server Error" : err.message;

  logger.error(err.message, {
    id: errorId,
    status: statusCode,
    error: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    Errors: [
      {
        ref: errorId,
        type: err.name,
        message: message,
        path: req.path,
        method: req.method,
        location: "server",
        stack: isProduction ? null : err.stack,
      },
    ],
  });
};
