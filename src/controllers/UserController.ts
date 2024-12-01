import { NextFunction, Response } from "express";
import { CreateUserRequest } from "../types";
import { UserService } from "./../services/UserService";
import { Roles } from "./../constants/index";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

export class UserController {
  constructor(readonly userService: UserService) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password, tenantId, role } = req.body;

    if (role !== Roles.MANAGER) {
      const error = createHttpError(403, "You don't have enough permissions");
      next(error);
      return;
    }

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        tenantId,
        role,
      });
      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAll();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(Number(req.params.id));
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: CreateUserRequest, res: Response, next: NextFunction) {
    try {
      await this.userService.delete(Number(req.params.id));
      res.status(200).json({ message: "deleted" });
    } catch (error) {
      next(error);
    }
  }

  async update(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    try {
      const user = await this.userService.update(
        Number(req.params.id),
        req.body,
      );
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}
