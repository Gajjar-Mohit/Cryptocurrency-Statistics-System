import { Router } from "express";
import cryptoRoutes from "./crypto.route";

const router = Router();

// Mount the crypto routes
router.use(cryptoRoutes);

export default router;
