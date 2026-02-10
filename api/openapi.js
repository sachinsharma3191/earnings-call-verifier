import { handleWithFastify } from "./_lib/fastifyHandler";

export default async function handler(req, res) {
  return handleWithFastify(req, res);
}
