import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "./../../config/data-source";
import app from "./../../app";
import { Tenant } from "./../../entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "./../../constants/index";

// To update tenant with id 1
describe("DELETE /tenants", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken = "";

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  }, 10000);

  beforeEach(async () => {
    jwks.start();
    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });
    // database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  }, 10000);

  afterAll(async () => {
    jwks.stop();
    await connection.destroy();
  }, 10000);

  describe("Given all fields", () => {
    it("should delete tenant with id 1", async () => {
      const tenantRepository = connection.getRepository(Tenant);
      await tenantRepository.save({ name: "Tenant 1", address: "Address 1" });
      await tenantRepository.save({ name: "Tenant 2", address: "Address 2" });

      const response = await request(app)
        .delete("/tenants/1")
        .set("Cookie", [`access_token=${adminToken};`]);

      expect(response.statusCode).toBe(200);
    });
  });
});
