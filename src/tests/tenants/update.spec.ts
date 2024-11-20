import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "./../../config/data-source";
import app from "./../../app";
import { Tenant } from "./../../entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "./../../constants/index";

// To update tenant with id 1
describe("PUT /tenants", () => {
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
    it("should update tenant with id 1", async () => {
      const tenantRepository = connection.getRepository(Tenant);
      await tenantRepository.save({ name: "Tenant 1", address: "Address 1" });
      await tenantRepository.save({ name: "Tenant 2", address: "Address 2" });

      const payload = {
        name: "Tenant 1 updated",
        address: "Address 1 updated",
      };

      await request(app)
        .put("/tenants/1")
        .send(payload)
        .set("Cookie", [`access_token=${adminToken};`]);

      const response = await request(app)
        .get("/tenants/1")
        .set("Cookie", [`access_token=${adminToken};`]);

      expect(response.statusCode).toBe(200);
      expect((response.body as Record<string, string>).id).toBe(1);
      expect((response.body as Record<string, string>).name).toBe(payload.name);
      expect((response.body as Record<string, string>).address).toBe(
        payload.address,
      );
    });
  });
});
