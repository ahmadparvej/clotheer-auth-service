import createJWKSMock from "mock-jwks";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";

describe("POST /auth/logout", () => {
  let connection: DataSource;

  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  }, 10000);

  beforeEach(async () => {
    jwks.start();
    // database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  }, 10000);

  afterAll(async () => {
    await connection.destroy();
  }, 10000);

  afterEach(() => {
    jwks.stop();
  }, 10000);

  describe("Logout", () => {
    it("should return 200 status code", () => {
      //Act
      // Generate token
      // const access_token = jwks.token({
      //   sub: "1",
      //   role: Roles.CUSTOMER,
      // });
      //   const response = await request(app)
      //     .get("/auth/logout")
      //     .set("Cookie", [`access_token=${access_token};`])
      //     .send();
      //   console.log("response", response);
      //Assert
      //   expect(response.statusCode).toBe(200);
    });
  });
});
