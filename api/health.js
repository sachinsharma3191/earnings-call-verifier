import { handleWithFastify } from "./_lib/fastifyHandler.js";
import { initializeCache } from "./_lib/init.js";

// Initialize cache on first request
initializeCache();

export default async function handler(req, res) {
  return handleWithFastify(req, res);
}
