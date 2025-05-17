import mongoose, { Schema, Document } from "mongoose";

export interface ICryptoStats extends Document {
  coin: string;
  price: number;
  marketCap: number;
  change24h: number;
  timestamp: Date;
}

const CryptoStatsSchema: Schema = new Schema({
  coin: {
    type: String,
    required: true,
    enum: ["bitcoin", "ethereum", "matic-network"],
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  marketCap: {
    type: Number,
    required: true,
  },
  change24h: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Creating a compound index for efficient querying by coin and timestamp
CryptoStatsSchema.index({ coin: 1, timestamp: -1 });

export default mongoose.model<ICryptoStats>("CryptoStats", CryptoStatsSchema);
