import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "./../types/index";
import { UserService } from "./../services/UserService";
import { Logger } from "winston";
import { Roles } from "./../constants/index";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("registering user", {
      email,
      firstName,
      lastName,
      password: "*****",
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER,
      });
      this.logger.info("user created successfully", { id: user.id });
      res.status(200).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }
}
