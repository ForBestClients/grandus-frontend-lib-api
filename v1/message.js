import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { getClientIpAddress } from "grandus-lib/utils/request";
import { validateHoneypot, checkRateLimit } from "utils/antiSpam";
import client from "grandus-lib/utils/cache";
import { get } from "lodash";

export default async (req, res) => {
  const { body = {}, method } = req;

  res.setHeader("Content-Type", "application/json");

  // Anti-spam checks
  const ip = getClientIpAddress(req);

  // 1. Honeypot validation
  if (validateHoneypot(body._website)) {
    return res.status(400).json({
      error: 'Neplatný request',
      status: false,
      data: { messages: [] }
    });
  }

  // 2. Rate limiting (max 3 za hodinu)
  const isRateLimited = await checkRateLimit(ip, client, {
    keyPrefix: 'contact_form_message',
    maxRequests: 3,
    windowSeconds: 3600
  });

  if (isRateLimited) {
    return res.status(429).json({
      error: 'Príliš veľa požiadaviek. Skúste neskôr.',
      status: false,
      data: { messages: [] }
    });
  }

  // Odstrániť honeypot field pred forward na backend
  const { _website, ...cleanBody } = body;

  let url = `${reqApiHost(req)}/api/v2/contact-forms`;

  const response = await fetch(url, {
    headers: reqGetHeaders(req),
    method: "POST",
    body: JSON.stringify(cleanBody),
  }).then((result) => result.json());

  res.status(get(response, 'statusCode')).json(get(response, 'data'));
};
