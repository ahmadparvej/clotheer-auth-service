import "reflect-metadata";
import express, { Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import authRouter from "./routes/auth";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRouter);

app.use((err: HttpError, req: Request, res: Response) => {
  logger.error(err.message);
  const statusCode = err.statusCode;

  res.status(statusCode).json({
    errors: [
      {
        message: err.message,
        type: err.name,
        location: "",
      },
    ],
  });
});

export default app;
