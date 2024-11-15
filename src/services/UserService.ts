import { Repository } from "typeorm";
import { UserData } from "../types";
import { User } from "./../entity/User";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password, role }: UserData) {
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
        role: role,
      });
    } catch {
      const error = createHttpError(500, "failed to create user in database");
      throw error;
    }
  }

  async login({ email, password }: { email: string; password: string }) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      const error = createHttpError(401, "user not found");
      throw error;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = createHttpError(401, "invalid email or password");
      throw error;
    }
    return user;
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }
}
