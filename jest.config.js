/** @type {import('ts-jest').JestConfigWithTsJest} **/

// eslint-disable-next-line no-undef
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  verbose: true,
  collectCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!tests/**",
    "!**/node_modules/**",
    "!src/types/**",
    "!src/middlewares/globalErrorHandler.ts",
  ],
};
