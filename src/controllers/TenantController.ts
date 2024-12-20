import { NextFunction, Response } from "express";
import { TenantService } from "../services/TenantService";
import { TenantRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";

export class TenantController {
  constructor(
    readonly tenantService: TenantService,
    readonly logger: Logger,
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

  async getOne(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenant = await this.tenantService.getOne(Number(req.params.id));
      res.status(200).json(tenant);
    } catch (error) {
      next(error);
    }
  }

  async update(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenant = await this.tenantService.update(
        Number(req.params.id),
        req.body,
      );
      res.status(200).json(tenant);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      await this.tenantService.delete(Number(req.params.id));
      res.status(200).json({ message: "deleted" });
    } catch (error) {
      next(error);
    }
  }
}
