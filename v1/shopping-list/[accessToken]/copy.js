import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost, getApiExpand } from "grandus-lib/utils";;
import get from "lodash/get";

export default withSession(async (req, res) => {
  const { body = {}, method, query } = req;

  res.setHeader("Content-Type", "application/json");

  let shoppingList = null;
  let url = `${reqApiHost(req)}/api/v2/shopping-lists/${query?.accessToken}/copy`;

  if (getApiExpand("SHOPPING_LIST")) {
    url += "?" + getApiExpand("SHOPPING_LIST", true);
  }

  if (getApiExpand("SHOPPING_LIST", false, "FIELDS")) {
    url +=
      (getApiExpand("SHOPPING_LIST") ? "&" : "?") +
      getApiExpand("SHOPPING_LIST", true, "FIELDS");
  }
  
  switch (method) {
    case "POST":
      shoppingList = await fetch(url, {
        headers: reqGetHeaders(req),
        method: "POST",
        body: body,
      }).then((result) => result.json());

      res.status(get(shoppingList, "statusCode", 500)).json(get(shoppingList, "data"));
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
