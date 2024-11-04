import { Response } from "express";
import { RegisterUserRequest } from "./../types/index";
import { UserService } from "./../services/UserService";

export class AuthController {
  constructor(private userService: UserService) {}

  async register(req: RegisterUserRequest, res: Response) {
    const { firstName, lastName, email, password } = req.body;

    await this.userService.create({ firstName, lastName, email, password });

    res.status(200).json({ message: "OK" });
  }
}
