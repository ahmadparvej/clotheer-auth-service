import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "./../../config/data-source";
import app from "./../../app";
import createJWKSMock from "mock-jwks";
import { Roles } from "./../../constants/index";
import { createTenant } from "./../utils/index";
import { Tenant } from "./../../entity/Tenant";
import { ITenant } from "./../../types/index";

describe("GET /users", () => {
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
    // database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  }, 10000);

  afterAll(async () => {
    jwks.stop();
    await connection.destroy();
  }, 10000);

  describe("Given all fields", () => {
    it("should return all users without search term or role", async () => {
      //create tenant
      const tenant = { name: "Tenant 1" };
      tenantData = await createTenant(connection.getRepository(Tenant));

      //Arrange
      const userData1 = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
        tenantId: 1,
        role: Roles.MANAGER,
      };

      const create_user_response = await request(app)
        .post("/users")
        .set("Cookie", [`access_token=${adminToken};`])
        .send(userData1);

      expect(create_user_response.statusCode).toBe(201);
      expect(create_user_response.body).toHaveProperty("id");

      //Act
      const response = await request(app)
        .get("/users")
        .set("Cookie", [`access_token=${adminToken};`]);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.total).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(6);
    });

    it("should return all users with search term", async () => {
      //create tenant
      const tenant = {
        name: "Tenant 1",
        address: "Address 1",
      };

      await request(app)
        .post("/tenants")
        .send(tenant)
        .set("Cookie", [`access_token=${adminToken};`]);

      //Arrange
      const userData1 = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
        tenantId: 1,
        role: Roles.MANAGER,
      };

      await request(app)
        .post("/users")
        .set("Cookie", [`access_token=${adminToken};`])
        .send(userData1);

      //Act
      const response = await request(app)
        .get("/users?page=1&limit=6&q=John")
        .set("Cookie", [`access_token=${adminToken};`]);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.total).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(6);
    });

    it("should return all users with search term and role", async () => {
      //create tenant
      const tenant = {
        name: "Tenant 1",
        address: "Address 1",
      };

      await request(app)
        .post("/tenants")
        .send(tenant)
        .set("Cookie", [`access_token=${adminToken};`]);

      //Arrange
      const userData1 = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
        tenantId: 1,
        role: Roles.MANAGER,
      };

      await request(app)
        .post("/users")
        .set("Cookie", [`access_token=${adminToken};`])
        .send(userData1);

      //Act
      const response = await request(app)
        .get("/users?page=1&limit=6&q=John&role=manager")
        .set("Cookie", [`access_token=${adminToken};`]);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.total).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(6);
    });
  });
});
