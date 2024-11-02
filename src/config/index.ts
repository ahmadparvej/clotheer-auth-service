import { config } from "dotenv";
config();

const { PORT } = process.env;

export const Config = {
  PORT: Number(PORT),
  NODE_ENV: process.env.NODE_ENV,
};
