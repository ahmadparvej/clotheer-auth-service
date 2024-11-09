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
  });
});
