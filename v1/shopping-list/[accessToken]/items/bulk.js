import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import get from "lodash/get";

export default withSession(async (req, res) => {
  const { body, method, query } = req;

  res.setHeader("Content-Type", "application/json");

  if (method !== "POST" && method !== "DELETE") {
    res.setHeader("Allow", ["POST", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const url = `${reqApiHost(req)}/api/v2/shopping-lists/${query?.accessToken}/items/bulk`;

  const shoppingList = await fetch(url, {
    headers: reqGetHeaders(req),
    method: method,
    body: body,
  }).then((result) => result.json());

  res.status(get(shoppingList, "statusCode", 500)).json(get(shoppingList, "data"));
});
