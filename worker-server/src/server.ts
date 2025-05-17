import App from "./app";
import logger from "./utils/logger";

const app = new App();

const startServer = async () => {
  try {
    // Connect to NATS
    await app.connectToNats();

    // Start the cron job
    app.startCronJob();

    // Trigger immediate update
    logger.info("Triggering initial crypto stats update");
    await app.natsService.publish("crypto.update", { trigger: "update" });

    logger.info("Worker server started successfully");

    // Handle graceful shutdown
    setupGracefulShutdown();
  } catch (error) {
    logger.error(`Failed to start worker server: ${(error as Error).message}`);
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
  await app.shutdown();
  process.exit(0);
};

// Start the server
startServer();
