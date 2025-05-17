import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/crypto-stats",
  natsUrl: process.env.NATS_URL || "nats://localhost:4222",
  coinGeckoApiUrl: "https://api.coingecko.com/api/v3",
  supportedCoins: ["bitcoin", "ethereum", "matic-network"],
  environment: process.env.NODE_ENV || "development",
};

export default config;
