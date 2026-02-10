import { handleWithFastify } from "../lib/fastifyHandler.js";
import { initializeCache } from "../lib/init.js";

// Initialize cache on first cold start
initializeCache();

export default async function handler(req, res) {
  return handleWithFastify(req, res);
}
