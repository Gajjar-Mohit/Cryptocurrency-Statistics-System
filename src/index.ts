import dotenv from "dotenv";

import connectDB from "./db/index";
import NatsService from "./services/nats.service";
import express  from "express";
import router from "./routes";

dotenv.config();
const app = express(); 

app.use(express.json());
app.use("/api/v1", router);
const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

const start = async (): Promise<void> => {
  await connectDB();
//   await NatsService.getInstance().connect;

  app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
  });
};

start();
