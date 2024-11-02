import { config } from "dotenv";
config();

const { PORT } = process.env;

export const Config = {
  PORT: Number(PORT) || 3000,
};
