import { Config } from "./config/index";
import app from "./app";
import logger from "./config/logger";
import { AppDataSource } from "./config/data-source";

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    await AppDataSource.initialize();
    logger.info("Database connected");

    app.listen(PORT, () => {
      logger.info(`Server is listening on port ${PORT}`);
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
    }

    process.exit(1);
  }
};

void startServer();
