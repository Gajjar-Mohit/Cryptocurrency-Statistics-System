import express, { Express } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import config from "./config";
import logger from "./utils/logger";
import { errorHandler } from "./utils/error_handler";
import NatsService from "./services/nats.service";
import cryptoService from "./services/crypto.service";

class App {
  public app: Express;
  private natsService = NatsService.getInstance();

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Add security middleware
    this.app.use(helmet());

    // Enable CORS
    this.app.use(cors());

    // Parse JSON
    this.app.use(express.json());

    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true }));

    // Add request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    this.app.use(routes);
  }

  private setupErrorHandling(): void {
    // Handle 404
    this.app.use((req, res) => {
      res.status(404).json({ status: "error", message: "Endpoint not found" });
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  public async connectToDatabase(): Promise<void> {
    try {
      await mongoose.connect(config.mongoUri);
      logger.info(`Connected to MongoDB: ${config.mongoUri}`);
    } catch (error) {
      logger.error(`Failed to connect to MongoDB: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  public async connectToNats(): Promise<void> {
    try {
      await this.natsService.connect();

      // Subscribe to the update event
      await this.natsService.subscribe("crypto.update", async (data) => {
        logger.info(`Received update event: ${JSON.stringify(data)}`);
        if (data && data.trigger === "update") {
          await cryptoService.storeCryptoStats();
        }
      });
    } catch (error) {
      logger.error(`Failed to connect to NATS: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    try {
      // Close MongoDB connection
      await mongoose.disconnect();
      logger.info("Disconnected from MongoDB");

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
