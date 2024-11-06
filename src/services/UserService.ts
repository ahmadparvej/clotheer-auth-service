import { Repository } from "typeorm";
import { UserData } from "../types";
import { User } from "./../entity/User";
import createHttpError from "http-errors";
import { Roles } from "./../constants/index";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
    //Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user to database
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });
    } catch {
      const error = createHttpError(500, "failed to create user in database");
      throw error;
    }
  }
}
