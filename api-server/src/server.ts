import App from "./app";
import config from "./config";
import logger from "./utils/logger";
import cryptoService from "./services/crypto.service";


const app = new App();
let server: any;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await app.connectToDatabase();

    // Connect to NATS
    await app.connectToNats();

    // Initial data collection
    await cryptoService.storeCryptoStats();

    // Start the Express server
    server = app.app.listen(config.port, () => {
      logger.info(`API server running on port ${config.port}`);
    });

    // Handle graceful shutdown
    setupGracefulShutdown();
  } catch (error) {
    logger.error(`Failed to start server: ${(error as Error).message}`);
    process.exit(1);
  }
};

const setupGracefulShutdown = () => {
  // Handle process termination
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully");
    await shutdown();
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT received, shutting down gracefully");
    await shutdown();
  });
};

const shutdown = async () => {
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
    });
  }

  await app.shutdown();
  process.exit(0);
};

// Start the server
startServer();
