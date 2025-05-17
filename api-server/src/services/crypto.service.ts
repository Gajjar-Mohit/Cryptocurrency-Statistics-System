import axios from "axios";
import config from "../config";
import logger from "../utils/logger";
import { CryptoStats } from "../models";
import { AppError } from "../utils/error_handler";

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_market_cap: number;
    usd_24h_change: number;
  };
}

class CryptoService {
  /**
   * Fetch crypto stats from CoinGecko API and store in the database
   */
  public async storeCryptoStats(): Promise<void> {
    console.log("Fetching cryptocurrency statistics from CoinGecko API");
    try {
      logger.info("Fetching cryptocurrency statistics from CoinGecko API");

      // Get list of coins to fetch
      const coins = config.supportedCoins;

      // Construct the CoinGecko API URL
      const url = `${config.coinGeckoApiUrl}/simple/price`;
      console.log(url);
      const params = {
        ids: coins.join(","),
        vs_currencies: "usd",
        include_market_cap: true,
        include_24hr_change: true,
      };

      // Make the API request
      const response = await axios.get<CoinGeckoResponse>(url, { params });
      console.log(response.data);
      // Process and store data for each coin
      const promises = coins.map(async (coin) => {
        if (!response.data[coin]) {
          logger.warn(`No data found for ${coin}, skipping`);
          return;
        }

        const coinData = response.data[coin];

        const stats = new CryptoStats({
          coin,
          price: coinData.usd,
          marketCap: coinData.usd_market_cap,
          change24h: coinData.usd_24h_change,
          timestamp: new Date(),
        });

        await stats.save();
        logger.info(
          `Stored stats for ${coin}: price=${coinData.usd}, marketCap=${coinData.usd_market_cap}, change24h=${coinData.usd_24h_change}`
        );
      });

      await Promise.all(promises);
      logger.info("Successfully stored cryptocurrency statistics");
    } catch (error) {
      logger.error(`Failed to store crypto stats: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get the latest stats for a specific coin
   */
  public async getLatestStats(
    coin: string
  ): Promise<{ price: number; marketCap: number; "24hChange": number }> {
    try {
      if (!config.supportedCoins.includes(coin)) {
        throw new AppError(`Coin ${coin} not supported`, 400);
      }

      const latestStats = await CryptoStats.findOne({ coin })
        .sort({ timestamp: -1 })
        .exec();

      if (!latestStats) {
        throw new AppError(`No stats found for ${coin}`, 404);
      }

      return {
        price: latestStats.price,
        marketCap: latestStats.marketCap,
        "24hChange": latestStats.change24h,
      };
    } catch (error) {
      logger.error(
        `Failed to get latest stats for ${coin}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  /**
   * Calculate standard deviation of price for a specific coin over the last 100 records
   */
  public async calculatePriceDeviation(coin: string): Promise<number> {
    try {
      if (!config.supportedCoins.includes(coin)) {
        throw new AppError(`Coin ${coin} not supported`, 400);
      }

      // Get the last 100 records for the specified coin
      const records = await CryptoStats.find({ coin })
        .sort({ timestamp: -1 })
        .limit(100)
        .exec();

      if (records.length === 0) {
        throw new AppError(`No records found for ${coin}`, 404);
      }

      // Extract prices
      const prices = records.map((record) => record.price);

      // Calculate standard deviation
      const mean =
        prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const squaredDifferences = prices.map((price) =>
        Math.pow(price - mean, 2)
      );
      const variance =
        squaredDifferences.reduce((sum, diff) => sum + diff, 0) / prices.length;
      const stdDeviation = Math.sqrt(variance);

      return parseFloat(stdDeviation.toFixed(2));
    } catch (error) {
      logger.error(
        `Failed to calculate price deviation for ${coin}: ${
          (error as Error).message
        }`
      );
      throw error;
    }
  }
}

export default new CryptoService();
