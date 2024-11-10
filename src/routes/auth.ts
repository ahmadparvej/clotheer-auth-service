import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { AuthController } from "./../controllers/AuthController";
import { UserService } from "./../services/UserService";
import { AppDataSource } from "./../config/data-source";
import { User } from "./../entity/User";
import logger from "./../config/logger";
import registerValidator from "../validators/register-validator";
import { TokenService } from "./../services/TokenService";
import { RefreshToken } from "./../entity/RefreshToken";
import loginValidator from "../validators/login-validator";
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "./../types/index";

const authRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);

const authService = new UserService(userRepository);

const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

const tokenService = new TokenService(refreshTokenRepository);

const authController = new AuthController(authService, logger, tokenService);

authRouter.post(
  "/register",
  registerValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
);

authRouter.post(
  "/login",
  loginValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next),
);

authRouter.get(
  "/self",
  authenticate as RequestHandler,
  (req: Request, res: Response, next: NextFunction) =>
    authController.self(req as AuthRequest, res, next),
);

export default authRouter;
