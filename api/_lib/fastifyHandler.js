import { getFastifyApp } from "./fastifyApp";

function normalizeHeaders(headers) {
  const out = {};
  if (!headers) return out;
  for (const [k, v] of Object.entries(headers)) {
    if (typeof v === "string") out[k] = v;
    else if (Array.isArray(v)) out[k] = v.join(",");
    else if (typeof v === "number") out[k] = String(v);
  }
  return out;
}

export async function handleWithFastify(req, res) {
  const app = await getFastifyApp();

  const method = req.method || "GET";
  const url = req.url || "/";
  const headers = normalizeHeaders(req.headers);

  const payload = req.body;

  const reply = await app.inject({
    method,
    url,
    headers,
    payload
  });

  res.statusCode = reply.statusCode;

  for (const [k, v] of Object.entries(reply.headers)) {
    if (v !== undefined) res.setHeader(k, String(v));
  }

  res.end(reply.rawPayload);
}
