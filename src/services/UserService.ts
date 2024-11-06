import { Repository } from "typeorm";
import { UserData } from "../types";
import { User } from "./../entity/User";
import createHttpError from "http-errors";
import { Roles } from "./../constants/index";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password }: UserData) {
    //Check if user already exists
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      const error = createHttpError(400, "user already exists");
      throw error;
    }

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
