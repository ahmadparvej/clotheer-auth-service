import request from "supertest";
import { DataSource } from "typeorm";
import app from "./../../app";
import { AppDataSource } from "./../../config/data-source";
import { Roles } from "./../../constants/index";
import bcrypt from "bcrypt";

describe("POST /auth/register", () => {
  let connection: DataSource;
  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

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
      expect(user[0].password).toBeDefined();
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
      const user = await userRepository.findOneBy({
        email: "b8x0n@example.com",
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
  });
  describe("Fiels are missing", () => {});
});
