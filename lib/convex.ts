import { ConvexHttpClient } from "convex/browser";

let convexInstance: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
  }
  if (!convexInstance) {
    convexInstance = new ConvexHttpClient(url);
  }
  return convexInstance;
}
