import { reqGetHeaders, reqApiHost, getApiExpand } from "grandus-lib/utils";
import { get } from "lodash";

export default async (req, res) => {
  const { body = {}, method } = req;
  const orderAccessToken = get(req, "query.orderToken");

  res.setHeader("Content-Type", "application/json");

  if (!orderAccessToken) {
    res.statusCode = 404;
    res.end(JSON.stringify([{ message: "objednávka neexistuje" }]));
    return;
  }

  let url = `${reqApiHost(req)}/api/v2/orders`;

  if (orderAccessToken) {
    url += `/${orderAccessToken}`;
  }

  if (getApiExpand("ORDER") !== "undefined") {
    url += "?" + getApiExpand("ORDER", true);
  } else {
    url += "?expand=orderItems.product.categories";
  }

  if (getApiExpand("ORDER", false, "FIELDS") !== "undefined") {
    url += "&" + getApiExpand("ORDER", true, "FIELDS");
  }

  const order = await fetch(url, {
    headers: reqGetHeaders(req),
  }).then((result) => result.json());
  // Get data from your database
  //   res.status(200).json({ id, name: `User ${id}` });

  const orderData = get(order, "data");
  res.status(get(order, "statusCode")).json(orderData ? orderData : "{}");
  return;
};
