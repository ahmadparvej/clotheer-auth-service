import { NextFunction, Response } from "express";
import { CreateUserRequest } from "../types";
import { UserService } from "./../services/UserService";

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password, tenantId, role } = req.body;

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
}
