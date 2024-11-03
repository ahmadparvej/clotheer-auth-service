import app from "./../../app";
import request from "supertest";

describe("POST /auth/register", () => {
  describe("Given all fields", () => {
    it("should return 200 status code", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return value json response", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.headers["content-type"]).toContain("application/json");
    });

    it("should persist user in database", async () => {
      //Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "b8x0n@example.com",
        password: "password",
      };

      //Act
      await request(app).post("/auth/register").send(userData);

      //Assert
      // expect(response.body.message).toBe("OK");
    });
  });
  describe("Fiels are missing", () => {});
});
