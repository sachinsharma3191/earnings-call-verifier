import { handleWithFastify } from "./_lib/fastifyHandler.js";

export default async function handler(req, res) {
  return handleWithFastify(req, res);
}
