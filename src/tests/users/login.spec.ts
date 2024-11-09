import { DataSource } from "typeorm";
import { AppDataSource } from "./../../config/data-source";
import app from "./../../app";
import request from "supertest";

describe("POST /auth/login", () => {
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

  describe("given all fields", () => {
    it("should return 200 status code", async () => {
      //Arrange
      const userData = {
        email: "b8x0n@example.com",
        password: "password",
        role: "customer",
        firstName: "John",
        lastName: "Doe",
      };

      const loginCredentials = {
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(loginCredentials);

      //Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return value json response", async () => {
      //Arrange
      const userData = {
        email: "b8x0n@example.com",
        password: "password",
        role: "customer",
        firstName: "John",
        lastName: "Doe",
      };

      const loginCredentials = {
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(loginCredentials);

      //Assert
      expect(response.headers["content-type"]).toContain("application/json");
    });

    it("should check if user exists in database", async () => {
      //Arrange
      const userData = {
        email: "b8x0n@example.com",
        password: "password",
        role: "customer",
        firstName: "John",
        lastName: "Doe",
      };

      const loginCredentials = {
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);
      await request(app).post("/auth/login").send(loginCredentials);

      //Assert
      const userRepository = connection.getRepository("User");
      const user = await userRepository.findOneBy({
        email: "b8x0n@example.com",
      });
      expect(user).toHaveProperty("id");
    });

    it("should check if password is incorrect", async () => {
      //Arrange
      const userData = {
        email: "b8x0n@example.com",
        password: "password",
        role: "customer",
        firstName: "John",
        lastName: "Doe",
      };

      const loginCredentials = {
        email: "b8x0n@example.com",
        password: "passworb",
      };

      //Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(loginCredentials);

      //Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return token in cookie", async () => {
      //Arrange
      const userData = {
        email: "b8x0n@example.com",
        password: "password",
        role: "customer",
        firstName: "John",
        lastName: "Doe",
      };

      const loginCredentials = {
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(loginCredentials);

      // Assert
      expect(response.headers["set-cookie"]).toBeDefined();
    });
  });

  describe("Fields are missing", () => {
    it("should return 400 status code if email is missing", async () => {
      //Arrange
      const userData = {
        password: "password",
        role: "customer",
        firstName: "John",
        lastName: "Doe",
      };

      const loginCredentials = {
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(loginCredentials);

      //Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if password is missing", async () => {
      //Arrange
      const userData = {
        email: "b8x0n@example.com",
        role: "customer",
        firstName: "John",
        lastName: "Doe",
      };

      const loginCredentials = {
        email: "b8x0n@example.com",
      };

      //Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(loginCredentials);

      //Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Fields are not in proper format", () => {
    it("should trim the email field", async () => {
      //Arrange
      const userData = {
        email: " b8x0n@example.com ",
        password: "password",
        role: "customer",
        firstName: "John",
        lastName: "Doe",
      };

      const loginCredentials = {
        email: " b8x0n@example.com ",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);
      const response = await request(app)
        .post("/auth/login")
        .send(loginCredentials);

      //Assert
      expect(response.statusCode).toBe(200);
    });
  });
});
