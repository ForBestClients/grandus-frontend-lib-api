import withSession from "grandus-lib/utils/session";
import { reqGetHost } from "grandus-lib/utils";
import { get } from "lodash";
import { LEGAL_COOKIE_CONSENT } from "grandus-lib/constants/SessionConstants";

const generateOutput = (webinstance, consent) => {
  return {
    ...consent,
    link: get(webinstance, "globalSettings.cookie_policy_page", null),
  };
};

export default withSession(async (req, res) => {
  const { method, body } = req;

  switch (method) {
    case "GET":
      const cookieConsent = req.session.get(LEGAL_COOKIE_CONSENT);
      const webinstance = await fetch(
        `${reqGetHost(req)}/api/lib/v1/webinstance`
      ).then((result) => result.json());

      res.status(200).json(generateOutput(webinstance, cookieConsent));
      break;

    case "PUT":
      const parsedBody = body ? JSON.parse(body) : {};
      const newConsent = { ...parsedBody, accepted: true };
      req.session.set(LEGAL_COOKIE_CONSENT, newConsent);
      await req.session.save();

      res.status(200).json(generateOutput({}, newConsent));
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
