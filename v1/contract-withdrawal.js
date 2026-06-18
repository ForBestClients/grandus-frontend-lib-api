import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { get } from "lodash";

/**
 * Shared endpoint for the "Odstúpenie od zmluvy" (contract withdrawal) form
 * (§ 20a zák. 108/2024 Z. z.). Mirrors the classic contact form proxy
 * (v1/message.js): forwards to the Grandus contact-forms API, but pins
 * `type: "contract_withdrawal"` server-side so it cannot be spoofed/omitted
 * by the client.
 */
export default async (req, res) => {
  const { body = {} } = req;

  res.setHeader("Content-Type", "application/json");

  const payload = typeof body === "string" ? JSON.parse(body || "{}") : body;

  const url = `${reqApiHost(req)}/api/v2/contact-forms`;

  const response = await fetch(url, {
    headers: reqGetHeaders(req),
    method: "POST",
    body: JSON.stringify({ ...payload, type: "contract_withdrawal" }),
  }).then((result) => result.json());

  res.status(get(response, "statusCode")).json(get(response, "data"));
};
