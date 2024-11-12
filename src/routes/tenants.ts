import express, { RequestHandler } from "express";
import { TenantController } from "./../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "./../config/data-source";
import { Tenant } from "./../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";

const tenantsRouter = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

tenantsRouter.post("/", authenticate as RequestHandler, (req, res, next) =>
  tenantController.create(req, res, next),
);

export default tenantsRouter;
