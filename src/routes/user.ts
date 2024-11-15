import express, { RequestHandler } from "express";
import { UserController } from "./../controllers/UserController";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "./../middlewares/canAccess";
import { Roles } from "./../constants/index";
import { UserService } from "./../services/UserService";
import { AppDataSource } from "./../config/data-source";
import { User } from "./../entity/User";

const userRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const userController = new UserController(userService);

userRouter.post(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.create(req, res, next),
);

userRouter.get(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.getAll(req, res, next),
);

userRouter.get(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.getOne(req, res, next),
);

export default userRouter;
