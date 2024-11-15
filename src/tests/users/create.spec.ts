import { DataSource } from "typeorm";
import { AppDataSource } from "./../../config/data-source";
import app from "./../../app";
import request from "supertest";
import createJWKSMock from "mock-jwks";
import { User } from "./../../entity/User";
import { Roles } from "./../../constants/index";
import { createTenant } from "./../utils/index";
import { Tenant } from "./../../entity/Tenant";
import { ITenant } from "./../../types/index";

describe("Post /users", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken = "";
  let tenantData: ITenant;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });
    tenantData = await createTenant(connection.getRepository(Tenant));
    // database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    jwks.stop();
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should persist user in database", async () => {
      //Act

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
        tenantId: tenantData.id,
        role: Roles.MANAGER,
      };

      //Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", [`access_token=${adminToken};`])
        .send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(response.statusCode).toBe(201);
      expect(users).toHaveLength(1);
    });

    it("should create a manager user", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
        tenantId: tenantData.id,
        role: Roles.MANAGER,
      };

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`access_token=${adminToken};`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(response.statusCode).toBe(201);
      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
    });

    it("should return 403 if non-admin user tries to create user", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
        tenantId: tenantData.id,
        role: Roles.CUSTOMER,
      };

      const response = await request(app)
        .post("/users")
        .set("Cookie", [`access_token=${adminToken};`])
        .send(userData);

      expect(response.statusCode).toBe(403);
    });
  });
});
