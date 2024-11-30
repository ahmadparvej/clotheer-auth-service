import "reflect-metadata";
import express, { Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./config/logger";
import authRouter from "./routes/auth";
import cookieParser from "cookie-parser";
import tenantsRouter from "./routes/tenants";
import userRouter from "./routes/user";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  }),
);
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantsRouter);
app.use("/users", userRouter);

app.use((err: HttpError, req: Request, res: Response) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;

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
