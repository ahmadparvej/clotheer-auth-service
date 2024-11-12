import { DataSource } from "typeorm";
import { AppDataSource } from "./../../config/data-source";
import app from "./../../app";
import request from "supertest";
import { Tenant } from "./../../entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "./../../constants/index";

describe("POST /tenants", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken = "";

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });
    // database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    jwks.stop();
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return 201 status code", async () => {
      //Arrange
      const tenantData = {
        name: "Tenant 1",
        address: "Address 1",
      };

      //Act
      const response = await request(app)
        .post("/tenants")
        .send(tenantData)
        .set("Cookie", [`access_token=${adminToken};`]);

      //Assert
      expect(response.statusCode).toBe(201);
    });

    it("should create a tenant in the database", async () => {
      const tenantData = {
        name: "Tenant 1",
        address: "Address 1",
      };

      await request(app)
        .post("/tenants")
        .send(tenantData)
        .set("Cookie", [`access_token=${adminToken};`]);
      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.findOneBy({
        name: tenantData.name,
      });

      expect(tenant?.name).toBe(tenantData.name);
    });

    it("should return 401 if user is not authenticated", async () => {
      const tenantData = {
        name: "Tenant 1",
        address: "Address 1",
      };

      const response = await request(app).post("/tenants").send(tenantData);

      expect(response.statusCode).toBe(401);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(0);
    });
  });
});
