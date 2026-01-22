import withSession from "grandus-lib/utils/session";
import { CART_CONTACT_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { getClientIpAddress } from "grandus-lib/utils/request";
import { validateHoneypot, checkRateLimit } from "utils/antiSpam";
import client from "grandus-lib/utils/cache";
import { isEmpty } from 'lodash';

export default withSession(async (req, res) => {
  const { body = {}, method } = req;

  res.setHeader("Content-Type", "application/json");

  let cartContact = null;

  switch (method) {
    case "GET":

      cartContact = req.session.get(CART_CONTACT_CONSTANT);

      res.statusCode = 200;
      res.end(cartContact);
      break;

    case "POST":
      // Anti-spam checks
      const ip = getClientIpAddress(req);

      // 1. Honeypot validation
      if (validateHoneypot(body._website)) {
        res.statusCode = 400;
        return res.json({
          error: 'Neplatný request',
          status: false
        });
      }

      // 2. Rate limiting (max 5 za hodinu - vyšší limit pre košík)
      const isRateLimited = await checkRateLimit(ip, client, {
        keyPrefix: 'contact_form_cart',
        maxRequests: 5,
        windowSeconds: 3600
      });

      if (isRateLimited) {
        res.statusCode = 429;
        return res.json({
          error: 'Príliš veľa požiadaviek. Skúste neskôr.',
          status: false
        });
      }

      // Odstrániť honeypot field pred uložením do session
      const { _website, ...cleanBody } = body;

      req.session.set(CART_CONTACT_CONSTANT, cleanBody);
      await req.session.save();

      res.statusCode = 200;
      res.end(req.session.get(CART_CONTACT_CONSTANT));
      break;

    case "DELETE":
      req.session.unset(CART_CONTACT_CONSTANT);
      await req.session.save();

      res.statusCode = 500;
      const contact = req.session.get(CART_CONTACT_CONSTANT);
      if (isEmpty(contact)) {
        res.statusCode = 200;
      }
      res.json(!isEmpty(contact) ? contact : JSON.parse('{}'));
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
