import { Request, Response, NextFunction } from "express";
import { cryptoService } from "../services";
import logger from "../utils/logger";
import { AppError } from "../utils/error_handler";

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { coin } = req.query;

    if (!coin || typeof coin !== "string") {
      throw new AppError("Coin parameter is required", 400);
    }

    const stats = await cryptoService.getLatestStats(coin);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

export const getDeviation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { coin } = req.query;

    if (!coin || typeof coin !== "string") {
      throw new AppError("Coin parameter is required", 400);
    }

    const deviation = await cryptoService.calculatePriceDeviation(coin);

    res.status(200).json({ deviation });
  } catch (error) {
    next(error);
  }
};

export const triggerUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { trigger } = req.query;

    if (trigger === "update") {
      // Trigger immediate update of crypto stats
      await cryptoService.storeCryptoStats();
      res.status(200).json({ message: "Update triggered successfully" });
    } else {
      throw new AppError("Invalid trigger parameter", 400);
    }
  } catch (error) {
    next(error);
  }
};
