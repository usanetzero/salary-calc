import mongoose from "mongoose";

/**
 * Global cache that survives hot-module-reload in dev and persists across
 * every request in production. Guarantees a SINGLE connection for the
 * entire lifetime of the Node.js process — no reconnects per page visit.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/* eslint-disable no-var */
declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.__mongooseCache ?? {
  conn: null,
  promise: null,
};
if (!global.__mongooseCache) {
  global.__mongooseCache = cached;
}

export async function connectMongoDB(): Promise<typeof mongoose> {
  // Already connected → return instantly (no DB call, no log)
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not set. Please add your MongoDB connection string to .env.local",
    );
  }

  // If a connect attempt is already in-flight, await that same promise
  // (prevents duplicate connections from concurrent requests)
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 60000, // keep idle connections longer
        heartbeatFrequencyMS: 10000,
      })
      .then((m) => {
        console.log("[mongodb] Connected to MongoDB Atlas (single connection)");
        return m;
      })
      .catch((err) => {
        // Reset promise so the next call retries
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function isMongoConnected(): boolean {
  return cached.conn !== null && mongoose.connection.readyState === 1;
}

export default mongoose;
