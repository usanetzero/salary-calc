import mongoose from "mongoose";

let isConnected = false;

export async function connectMongoDB(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not set. Please add your MongoDB connection string to .env.local",
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("[mongodb] Connected to MongoDB Atlas");
  } catch (error) {
    console.error("[mongodb] Failed to connect:", error);
    throw error;
  }

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("[mongodb] Disconnected from MongoDB");
  });

  mongoose.connection.on("reconnected", () => {
    isConnected = true;
    console.log("[mongodb] Reconnected to MongoDB");
  });
}

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export default mongoose;
