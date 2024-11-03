import { config } from "dotenv";
config();

export const Config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
};
