import withSession from "grandus-lib/utils/session";
import { LEGAL_COOKIE_CONSENT } from "grandus-lib/constants/SessionConstants";

export default withSession(async (req, res) => {
  const { method } = req;

  switch (method) {
    case "GET":
      const cookieConsent = req.session.get(LEGAL_COOKIE_CONSENT);

      res.status(200).json({ accepted: cookieConsent ? true : false });
      break;

    case "PUT":
      req.session.set(LEGAL_COOKIE_CONSENT, true);
      await req.session.save();

      res.status(200).json({ accepted: true });
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
