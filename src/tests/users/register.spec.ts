import request from "supertest";
import { DataSource } from "typeorm";
import app from "./../../app";
import { AppDataSource } from "./../../config/data-source";
import { Roles } from "./../../constants/index";
import bcrypt from "bcrypt";
import { isJwt } from "../utils";
import { RefreshToken } from "./../../entity/RefreshToken";

describe("POST /auth/register", () => {
  let connection: DataSource;
  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  }, 10000);

  beforeEach(async () => {
    // database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  }, 10000);

  afterAll(async () => {
    await connection.destroy();
  }, 10000);

  describe("Given all fields", () => {
    it("should return 200 status code", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return value json response", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.headers["content-type"]).toContain("application/json");
    });

    it("should persist user in database", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository("User");
      const user = await userRepository.find();
      expect(user).toHaveLength(1);
      expect(user[0].firstName).toBe("John");
      expect(user[0].lastName).toBe("Doe");
      expect(user[0].email).toBe("b8x0n@example.com");
    });

    it("should return an id of created user", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository("User");
      const user = await userRepository.findOneBy({
        email: "b8x0n@example.com",
      });
      expect(user?.id).toBeDefined();
    });

    it("should assign a customer role", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository("User");
      const user = await userRepository.findOneBy({
        email: "b8x0n@example.com",
      });
      expect(user?.role).toBe(Roles.CUSTOMER);
    });

    it("should store password in hashed format", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository("User");
      const user = await userRepository.findOne({
        where: { email: "b8x0n@example.com" },
        select: ["password"],
      });
      const isMatch = await bcrypt.compare(
        "password",
        user?.password as string,
      );
      expect(isMatch).toBe(true);
    });

    it("should return 400 status code if email already exists", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };
      const userRepository = connection.getRepository("User");
      await userRepository.save({ ...userData, role: "customer" });

      //Act
      const response = await request(app).post("/auth/register").send(userData);
      const users = await userRepository.find();

      //Assert
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });

    it("should return the access token and refresh token in cookie", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      interface Headers {
        ["set-cookie"]?: string[];
      }
      const cookies = (response.headers as Headers)["set-cookie"] || [];
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      cookies.forEach((cookie) => {
        if (cookie.startsWith("access_token=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }

        if (cookie.startsWith("refresh_token=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it("should restore the refresh token in database", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      const refreshTokenRepository = connection.getRepository(RefreshToken);
      // const refreshTokens = await refreshRepository.find();

      const tokens = await refreshTokenRepository
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId = :userId", {
          userId: (response.body as Record<string, string>).id,
        })
        .getMany();

      expect(tokens).toHaveLength(1);
    });
  });
  describe("Fields are missing", () => {
    it("should return 400 status code if email is missing", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        password: "password",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository("User");
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it("should return 400 status code if password is missing", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository("User");
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it("should return 400 status code if firstName is missing", async () => {
      //Arrange
      const userData = {
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository("User");
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });
  describe("Fields are not in proper format", () => {
    it("should trim the email field", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: " b8x0n@example.com ",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository("User");
      const users = await userRepository.find();

      //Assert
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe("b8x0n@example.com");
    });
    it("should check if email is valid", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0nexample.com",
        password: "password",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository("User");
      const users = await userRepository.find();

      //Assert
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(0);
    });
    it("should check if password is valid (less than 8 characters)", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "pass",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository("User");
      const users = await userRepository.find();

      //Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(response.body).toHaveProperty("errors[0].msg");
      expect(users).toHaveLength(0);
    });
  });
});
