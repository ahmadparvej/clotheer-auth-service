import express from "express";
import { AuthController } from "./../controllers/AuthController";
import { UserService } from "./../services/UserService";
import { AppDataSource } from "./../config/data-source";
import { User } from "./../entity/User";
import logger from "./../config/logger";

const authRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);

const authService = new UserService(userRepository);

const authController = new AuthController(authService, logger);

authRouter.post("/register", (req, res, next) =>
  authController.register(req, res, next),
);

export default authRouter;
