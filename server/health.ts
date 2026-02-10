export default async function handler(req: any, res: any) {
  res.status(200).json({
    status: "healthy",
    service: "earnings-verifier-api",
    version: "2.0.0-node"
  });
}
