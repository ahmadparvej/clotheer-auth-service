import { DataSource } from "typeorm";
import { AppDataSource } from "./../../config/data-source";
import app from "./../../app";
import request from "supertest";

describe("POST /tenants", () => {
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

  describe("Given all fields", () => {
    it("should return 201 status code", async () => {
      //Arrange
      const tenantData = {
        name: "Tenant 1",
        address: "Address 1",
      };

      //Act
      const response = await request(app).post("/tenants").send(tenantData);

      //Assert
      expect(response.statusCode).toBe(201);
    });
  });
});
