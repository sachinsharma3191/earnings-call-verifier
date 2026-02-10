export default async function handler(req: any, res: any) {
  const { handleWithFastify } = await import("../_lib/fastifyHandler");
  return handleWithFastify(req, res);
}
