import { Repository } from "typeorm";
import { UserData } from "../types";
import { User } from "./../entity/User";
import createHttpError from "http-errors";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password,
      });
    } catch {
      const error = createHttpError(500, "failed to create user in database");
      throw error;
    }
  }
}
