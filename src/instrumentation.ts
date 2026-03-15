/**
 * Next.js Instrumentation hook — runs once when the server starts.
 * We use it to eagerly connect to MongoDB so the first request doesn't
 * have to wait for a connection. The global cache in mongodb.ts ensures
 * this is the ONLY connect call for the entire server lifetime.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { connectMongoDB } = await import("@/lib/mongodb");
    try {
      await connectMongoDB();
      console.log("[instrumentation] MongoDB pre-connected on server start");
    } catch (err) {
      console.error("[instrumentation] Failed to pre-connect MongoDB:", err);
    }
  }
}
