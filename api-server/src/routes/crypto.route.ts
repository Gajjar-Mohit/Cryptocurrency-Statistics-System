import { Router } from "express";
import { cryptoController } from "../controllers";

const router = Router();

// GET /stats - Get latest stats for a specific coin
router.get("/stats", cryptoController.getStats);

// GET /stats?trigger=update - Trigger an update of crypto stats
router.get("/update", cryptoController.triggerUpdate);

// GET /deviation - Get standard deviation of price for a specific coin
router.get("/deviation", cryptoController.getDeviation);

export default router;
