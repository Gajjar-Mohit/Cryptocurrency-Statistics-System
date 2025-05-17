import { connect, NatsConnection, Subscription } from "nats";
import logger from "../utils/logger";
import config from "../config";

class NatsService {
  private static instance: NatsService;
  private nc: NatsConnection | null = null;
  private subscriptions: Map<string, Subscription> = new Map();

  private constructor() {}

  public static getInstance(): NatsService {
    if (!NatsService.instance) {
      NatsService.instance = new NatsService();
    }
    return NatsService.instance;
  }

  public async connect(): Promise<void> {
    try {
      this.nc = await connect({ servers: config.natsUrl });
      logger.info(`Connected to NATS at ${config.natsUrl}`);

      // Setup disconnect handler
      this.nc.closed().then(() => {
        logger.info("NATS connection closed");
      });
    } catch (error) {
      logger.error(`Failed to connect to NATS: ${(error as Error).message}`);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.nc) {
      // First, unsubscribe from all subscriptions
      for (const [subject, subscription] of this.subscriptions) {
        subscription.unsubscribe();
        logger.info(`Unsubscribed from ${subject}`);
      }
      this.subscriptions.clear();

      // Then close the connection
      await this.nc.close();
      this.nc = null;
      logger.info("NATS connection closed");
    }
  }

  public async publish(
    subject: string,
    data: Record<string, unknown>
  ): Promise<void> {
    if (!this.nc) {
      throw new Error("NATS not connected");
    }

    try {
      const encodedData = JSON.stringify(data);
      this.nc.publish(subject, Buffer.from(encodedData));
      logger.info(`Published message to ${subject}`);
    } catch (error) {
      logger.error(
        `Failed to publish message to ${subject}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  public async subscribe(
    subject: string,
    callback: (data: any) => void
  ): Promise<void> {
    if (!this.nc) {
      throw new Error("NATS not connected");
    }

    try {
      const subscription = this.nc.subscribe(subject);
      this.subscriptions.set(subject, subscription);

      logger.info(`Subscribed to ${subject}`);

      // Process incoming messages
      (async () => {
        for await (const message of subscription) {
          try {
            const data = JSON.parse(new TextDecoder().decode(message.data));
            await callback(data);
          } catch (error) {
            logger.error(
              `Error processing message from ${subject}: ${
                (error as Error).message
              }`
            );
          }
        }
      })();
    } catch (error) {
      logger.error(
        `Failed to subscribe to ${subject}: ${(error as Error).message}`
      );
      throw error;
    }
  }
}

export default NatsService;
