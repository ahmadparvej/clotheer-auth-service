import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "./../../config/data-source";
import app from "./../../app";
import createJWKSMock from "mock-jwks";
import { Roles } from "./../../constants/index";
import { createTenant } from "./../utils/index";
import { Tenant } from "./../../entity/Tenant";
import { ITenant } from "./../../types/index";
import { User } from "./../../entity/User";

describe("DELETE /users", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken = "";
  let tenantData: ITenant;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  }, 10000);

  beforeEach(async () => {
    jwks.start();
    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });
    tenantData = await createTenant(connection.getRepository(Tenant));
    // database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  }, 10000);

  afterAll(async () => {
    jwks.stop();
    await connection.destroy();
  }, 10000);

  describe("Given all fields", () => {
    it("should delete user by id", async () => {
      //Arrange
      const userData1 = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
        tenantId: tenantData.id,
        role: Roles.MANAGER,
      };

      await request(app)
        .post("/users")
        .set("Cookie", [`access_token=${adminToken};`])
        .send(userData1);

      //Act
      const response = await request(app)
        .delete("/users/1")
        .set("Cookie", [`access_token=${adminToken};`]);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      // Assert
      expect(response.statusCode).toBe(200);
      expect(users).toHaveLength(0);
    });
  });
});
