import { Brackets, Repository } from "typeorm";
import { UserData, UserQueryParams } from "../types";
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

  async getAll(validatedParams: UserQueryParams) {
    const { page, limit } = validatedParams;
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (validatedParams.q) {
      const searchTerm = `%${validatedParams.q}%`;

      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
            q: searchTerm,
          }).orWhere("user.email ILike :q", { q: searchTerm });
        }),
      );
    }

    if (validatedParams.role) {
      queryBuilder.andWhere("user.role = :role", {
        role: validatedParams.role,
      });
    }

    const result = queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("user.id", "DESC");
    return await result.getManyAndCount();
  }

  async delete(id: number) {
    return await this.userRepository.delete(id);
  }

  async update(id: number, userData: UserData) {
    return await this.userRepository.update(id, userData);
  }
}
