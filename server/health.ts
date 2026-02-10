import { handleWithFastify } from "./_lib/fastifyHandler";

export default async function handler(req: any, res: any) {
  return handleWithFastify(req, res);
}
