import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { get } from "lodash";

/**
 * Shared endpoint for the "Odstúpenie od zmluvy" (contract withdrawal) form
 * (§ 20a zák. 108/2024 Z. z.). Mirrors the classic contact form proxy
 * (v1/message.js): forwards to the Grandus contact-forms API, but pins
 * `type: "contract_withdrawal"` server-side so it cannot be spoofed/omitted
 * by the client.
 *
 * reCAPTCHA v3 (zdieľaný submodule – multi-tenant):
 *  - Overenie sa VYNUCUJE iba keď je na danom deployi nastavený
 *    RECAPTCHA_SECRET_KEY. Apky bez nastavenej reCAPTCHA (bez secret) posielajú
 *    formulár ďalej bez overenia.
 *  - Keď je secret nastavený, token je POVINNÝ a musí byť platný – inak 400.
 *    (Chýbajúci token už request neprepustí, čím sa zatvára bot bypass.)
 *  - Pri výpadku/timeoute samotného Google siteverify volíme fail-open: odoslanie
 *    odstúpenia od zmluvy je zákonné právo spotrebiteľa a nesmie padnúť kvôli
 *    výpadku infraštruktúry tretej strany. Reálne boty zachytí success:false /
 *    nízke skóre, nie infra chyba.
 */

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const RECAPTCHA_TIMEOUT_MS = 5000;
const RECAPTCHA_ACTION = "contract_withdrawal";

const sendJson = (res, statusCode, payload) => res.status(statusCode).json(payload);

// Tvar zodpovedá tomu, čo formulár parsuje: status (success) + data.messages.
const reject = (res, message) =>
  sendJson(res, 400, {
    status: false,
    data: { messages: [{ field: "recaptcha", message }] },
  });

const parseBody = (req) => {
  const { body = {} } = req;
  if (typeof body === "string") {
    return JSON.parse(body || "{}");
  }
  return body || {};
};

const verifyRecaptcha = async (token, secret, remoteIp) => {
  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token);
  if (remoteIp) params.append("remoteip", remoteIp);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RECAPTCHA_TIMEOUT_MS);

  try {
    const verify = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: controller.signal,
    }).then((result) => result.json());
    return { verify };
  } catch (error) {
    // Sieťová chyba / timeout pri volaní Google – nie je to chyba používateľa.
    return { error };
  } finally {
    clearTimeout(timeout);
  }
};

export default async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, {
      status: false,
      data: { messages: [{ field: "general", message: "Method Not Allowed" }] },
    });
  }

  let payload;
  try {
    payload = parseBody(req);
  } catch (error) {
    return reject(res, "Neplatný formát požiadavky.");
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;

  // reCAPTCHA sa vynucuje LEN keď je na tomto deployi nastavený secret.
  if (secret) {
    const recaptchaToken = get(payload, "recaptchaToken");

    if (!recaptchaToken) {
      return reject(
        res,
        "Overenie reCAPTCHA zlyhalo. Obnovte prosím stránku a skúste znova."
      );
    }

    const remoteIp =
      get(req, "headers.x-forwarded-for", "")?.split(",")[0]?.trim() ||
      get(req, "socket.remoteAddress", "");

    const { verify, error } = await verifyRecaptcha(
      recaptchaToken,
      secret,
      remoteIp
    );

    if (error) {
      // Fail-open: Google nedostupný / timeout. Legitímne odstúpenie od zmluvy
      // nesmie zlyhať kvôli výpadku infraštruktúry tretej strany.
      console.error(
        "contract-withdrawal recaptcha verify skipped (infra error):",
        error?.name || error
      );
    } else {
      const ok = get(verify, "success");
      const score = get(verify, "score");
      const action = get(verify, "action");
      const parsedMin = Number(process.env.RECAPTCHA_MIN_SCORE);
      const minScore = Number.isFinite(parsedMin) ? parsedMin : 0.5;

      if (!ok) {
        return reject(res, "Overenie reCAPTCHA zlyhalo. Skúste znova.");
      }

      if (typeof score !== "undefined" && score < minScore) {
        return reject(res, "Nízke skóre reCAPTCHA. Skúste znova.");
      }

      if (action && action !== RECAPTCHA_ACTION) {
        return reject(res, "Neplatná akcia reCAPTCHA.");
      }
    }
  }

  // Token nikdy neposielame na contact-forms backend.
  if (payload && typeof payload === "object") {
    delete payload.recaptchaToken;
  }

  try {
    const url = `${reqApiHost(req)}/api/v2/contact-forms`;

    const response = await fetch(url, {
      headers: reqGetHeaders(req),
      method: "POST",
      body: JSON.stringify({ ...payload, type: "contract_withdrawal" }),
    }).then((result) => result.json());

    return sendJson(res, get(response, "statusCode", 502), get(response, "data"));
  } catch (error) {
    console.error("contract-withdrawal forward failed:", error);
    return sendJson(res, 502, {
      status: false,
      data: {
        messages: [
          {
            field: "general",
            message: "Odoslanie sa nepodarilo. Skúste to prosím znova.",
          },
        ],
      },
    });
  }
};
