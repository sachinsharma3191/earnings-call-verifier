function getBaseUrl(req: any): string {
  const xfProto = req.headers?.["x-forwarded-proto"]; 
  const proto = Array.isArray(xfProto) ? xfProto[0] : xfProto;
  const scheme = proto || "https";

  const xfHost = req.headers?.["x-forwarded-host"]; 
  const hostHeader = Array.isArray(xfHost) ? xfHost[0] : xfHost;
  const host = hostHeader || req.headers?.host || "localhost";

  return `${scheme}://${host}`;
}

function buildSpec(baseUrl: string): string {
  return `openapi: 3.0.3
info:
  title: Earnings Call Verifier API
  version: 2.0.0
  description: Verify quantitative claims from earnings calls against SEC EDGAR financial data.
servers:
  - url: ${baseUrl}
paths:
  /api/health:
    get:
      summary: Health check
      responses:
        '200':
          description: OK
          content:
            application/json: {}
  /api/companies:
    get:
      summary: List supported companies
      responses:
        '200':
          description: OK
          content:
            application/json: {}
  /api/companies/{ticker}:
    get:
      summary: Get company financials
      parameters:
        - in: path
          name: ticker
          required: true
          schema:
            type: string
        - in: query
          name: quarters
          required: false
          schema:
            type: integer
            default: 4
      responses:
        '200':
          description: OK
          content:
            application/json: {}
        '404':
          description: Not found
          content:
            application/json: {}
  /api/companies/{ticker}/quarters:
    get:
      summary: Get available quarters
      parameters:
        - in: path
          name: ticker
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json: {}
  /api/companies/{ticker}/metrics/{quarter}:
    get:
      summary: Get calculated metrics for a quarter
      parameters:
        - in: path
          name: ticker
          required: true
          schema:
            type: string
        - in: path
          name: quarter
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json: {}
  /api/verification/verify:
    post:
      summary: Verify structured claims against SEC data
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [claims, ticker, quarter]
              properties:
                ticker:
                  type: string
                  example: NVDA
                quarter:
                  type: string
                  example: Q4 2024
                claims:
                  type: array
                  items:
                    type: object
                    required: [claimed, unit]
                    properties:
                      id:
                        type: string
                      speaker:
                        type: string
                      role:
                        type: string
                      text:
                        type: string
                      metric:
                        type: string
                      claimed:
                        type: number
                      unit:
                        type: string
                        example: billion
                      context:
                        type: string
      responses:
        '200':
          description: Verification results
          content:
            application/json: {}
        '400':
          description: Bad request
          content:
            application/json: {}
        '404':
          description: Not found
          content:
            application/json: {}
`;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "text/yaml; charset=utf-8");
  const baseUrl = getBaseUrl(req);
  res.status(200).send(buildSpec(baseUrl));
}
