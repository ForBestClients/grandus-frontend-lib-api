import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";

export default withSession(async (req, res) => {
  const { method, body, query } = req;

  let addressCard = null;

  switch (method) {
    case "GET":
      addressCard = await fetch(
        `${reqApiHost(req)}/api/v2/address-cards/${query?.id}`,
        {
          method: "GET",
          headers: reqGetHeaders(req),
        }
      ).then((result) => result.json());
      break;

    case "PUT":
      const userSession = req.session.get(USER_CONSTANT);
      const requestBody = { ...JSON.parse(body), relationId: userSession?.id };
      addressCard = await fetch(
        `${reqApiHost(req)}/api/v2/address-cards/${query?.id}`,
        {
          method: "PUT",
          body: JSON.stringify(requestBody),
          headers: reqGetHeaders(req),
        }
      ).then((result) => result.json());
      break;

    case "DELETE":
      addressCard = await fetch(
        `${reqApiHost(req)}/api/v2/address-cards/${query?.id}`,
        {
          method: "DELETE",
          headers: reqGetHeaders(req),
        }
      );
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }

  res.status(200).json(addressCard?.data || []);
});
