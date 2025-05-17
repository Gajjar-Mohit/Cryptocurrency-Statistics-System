import NatsService from "./service/nats.service";
import config from "./config";
import logger from "./utils/logger";
import * as cron from "node-cron";

class App {
   natsService = NatsService.getInstance();
  private cronJob: cron.ScheduledTask | null = null;

  public async connectToNats(): Promise<void> {
    try {
      await this.natsService.connect();
      logger.info("Worker connected to NATS");
    } catch (error) {
      logger.error(`Failed to connect to NATS: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  public startCronJob(): void {
    // Schedule a job to run every 15 minutes
    this.cronJob = cron.schedule("*/1 * * * *", async () => {
      try {
        logger.info("Triggering crypto stats update via NATS");
        await this.natsService.publish("crypto.update", { trigger: "update" });
        logger.info("Update event published successfully");
      } catch (error) {
        logger.error(
          `Failed to publish update event: ${(error as Error).message}`
        );
      }
    });

    logger.info("Scheduled cron job to run every 15 minutes");
  }

  public async shutdown(): Promise<void> {
    try {
      // Stop the cron job
      if (this.cronJob) {
        this.cronJob.stop();
        logger.info("Cron job stopped");
      }

      // Close NATS connection
      await this.natsService.close();
      logger.info("Disconnected from NATS");
    } catch (error) {
      logger.error(`Error during shutdown: ${(error as Error).message}`);
      process.exit(1);
    }
  }
}

export default App;
