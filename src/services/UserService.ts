import { Repository } from "typeorm";
import { UserData } from "../types";
import { User } from "./../entity/User";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";

export class UserService {
  constructor(readonly userRepository: Repository<User>) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
    //Check if user already exists
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      const error = createHttpError(400, "user already exists");
      throw error;
    }

    //Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const payload = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      tenant: tenantId ? { id: tenantId } : undefined,
    };

    // Save user to database
    try {
      return await this.userRepository.save(payload);
    } catch {
      const error = createHttpError(500, "failed to create user in database");
      throw error;
    }
  }

  async login({ email, password }: { email: string; password: string }) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ["id", "firstName", "lastName", "email", "role", "password"],
    });
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
      relations: {
        tenant: true,
      },
    });
  }

  async getAll() {
    return await this.userRepository.find();
  }

  async delete(id: number) {
    return await this.userRepository.delete(id);
  }

  async update(id: number, userData: UserData) {
    return await this.userRepository.update(id, userData);
  }
}
