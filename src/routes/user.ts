import express, {
  NextFunction,
  RequestHandler,
  Request,
  Response,
} from "express";
import { UserController } from "./../controllers/UserController";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "./../middlewares/canAccess";
import { Roles } from "./../constants/index";
import { UserService } from "./../services/UserService";
import { AppDataSource } from "./../config/data-source";
import { User } from "./../entity/User";
import listUsersValidator from "../validators/list-users-validator";

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
  listUsersValidator,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.getAll(req, res, next),
);

userRouter.get(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.getOne(req, res, next),
);

userRouter.delete(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.delete(req, res, next),
);

userRouter.put(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.update(req, res, next),
);

export default userRouter;
