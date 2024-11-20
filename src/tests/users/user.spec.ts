import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "./../../config/data-source";
import app from "./../../app";
import createJWKSMock from "mock-jwks";
import { User } from "./../../entity/User";
import { Roles } from "./../../constants/index";

describe("GET /auth/self", () => {
  let connection: DataSource;

  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    // database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(() => {
    jwks.stop();
  });

  describe("Given all fields", () => {
    it("should return 200 status code", async () => {
      //Act

      // Generate token
      const access_token = jwks.token({
        sub: "1",
        role: Roles.CUSTOMER,
      });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`access_token=${access_token};`])
        .send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return the user data", async () => {
      // Register user

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      // Generate token

      const access_token = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      // Add token to cookie
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`access_token=${access_token};`])
        .send();

      // Assert
      // Check if user id is the same as the one in the token
      expect((response.body as Record<string, string>).id).toBe(data.id);
    });

    it("should not return the password", async () => {
      // Register user

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      // Generate token

      const access_token = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      // Add token to cookie
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`access_token=${access_token};`])
        .send();

      // Assert
      // Check if user id is the same as the one in the token
      expect(response.body as Record<string, string>).not.toHaveProperty(
        "password",
      );
    });

    it("should return 401 status code if token is missing", async () => {
      //Register user

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      //Act
      const response = await request(app).get("/auth/self").send();

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
