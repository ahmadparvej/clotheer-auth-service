import { NextFunction } from "express";
import { Response } from "express";
import { TenantService } from "../services/TenantService";
import { TenantRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: TenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const { name, address } = req.body;

    this.logger.debug("Request for creating a tenant", req.body);

    try {
      const tenant = await this.tenantService.create({ name, address });

      this.logger.info("Tenant has been created", { id: tenant.id });

      res.status(201).json({ id: tenant.id });
    } catch (error) {
      next(error);
    }
  }

  async get(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.get();
      res.status(200).json(tenants);
    } catch (error) {
      next(error);
    }
  }
}
