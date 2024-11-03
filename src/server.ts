import { Config } from "./config/index";
import app from "./app";
import logger from "./config/logger";

const startServer = () => {
  const PORT = Config.PORT;
  try {
    app.listen(PORT, () => {
      logger.info(`Server is listening on port ${PORT}`);
    });
  } catch {
    process.exit(1);
  }
};

startServer();
