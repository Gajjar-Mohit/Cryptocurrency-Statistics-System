import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const config = {
  natsUrl: process.env.NATS_URL || "nats://localhost:4222",
  environment: process.env.NODE_ENV || "development",
};

export default config;
