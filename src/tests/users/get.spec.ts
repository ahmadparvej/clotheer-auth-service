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
    it("should return a list of users", async () => {
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
        tenantId: tenantData.id,
        role: Roles.MANAGER,
      };

      await request(app)
        .post("/users")
        .set("Cookie", [`access_token=${adminToken};`])
        .send(userData1);

      //create tenant
      const tenant2 = {
        name: "Tenant 2",
        address: "Address 2",
      };

      await request(app)
        .post("/tenants")
        .send(tenant2)
        .set("Cookie", [`access_token=${adminToken};`]);

      //create second user
      const userData2 = {
        firstName: "Parvej",
        lastName: "Ahmad",
        email: "parvej@example.com",
        password: "password",
        tenantId: 2,
        role: Roles.MANAGER,
      };

      await request(app)
        .post("/users")
        .set("Cookie", [`access_token=${adminToken};`])
        .send(userData2);

      //Act
      const response = await request(app)
        .get("/users")
        .set("Cookie", [`access_token=${adminToken};`]);

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    // it("should return user by id", async () => {

    //   //create tenant
    //   const tenant = {
    //     name: "Tenant 1",
    //     address: "Address 1",
    //   };

    //   await request(app)
    //     .post("/tenants")
    //     .send(tenant)
    //     .set("Cookie", [`access_token=${adminToken};`]);

    //   //Arrange
    //   const userData1 = {
    //     firstName: "John",
    //     lastName: "Doe",
    //     email: "b8x0n@example.com",
    //     password: "password",
    //     tenantId: tenantData.id,
    //     role: Roles.MANAGER,
    //   };

    //   await request(app)
    //     .post("/users")
    //     .set("Cookie", [`access_token=${adminToken};`])
    //     .send(userData1);

    //   //Act
    //   const response = await request(app)
    //     .get("/users/1")
    //     .set("Cookie", [`access_token=${managerToken};`]);

    //   //Assert
    //   expect(response.statusCode).toBe(200);
    //   console.log("response: ",response.body)
    //   expect((response.body as Record<string, string>).id).toBe(1);
    // });
  });
});
