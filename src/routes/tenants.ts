import express, {
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import { TenantController } from "./../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "./../config/data-source";
import { Tenant } from "./../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "./../constants/index";
import tenantValidator from "../validators/tenant-validator";

const tenantsRouter = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

tenantsRouter.post(
  "/",
  tenantValidator,
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next),
);

export default tenantsRouter;
