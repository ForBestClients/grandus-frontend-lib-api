import withSession, { extractSessionCart } from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost, getApiExpand } from "grandus-lib/utils";
import { CART_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get, map, isEmpty } from "lodash";

const appendUrlFields = (url) => {
  let newUrl = url;

  if (getApiExpand("CART")) {
    newUrl += "?" + getApiExpand("CART", true);
  }

  if (getApiExpand("CART", false, "FIELDS")) {
    newUrl +=
      (getApiExpand("CART") ? "&" : "?") + getApiExpand("CART", true, "FIELDS");
  }

  return newUrl;
};

const getCartItemsUrl = (url) => appendUrlFields(`${url}/items`);
const getCartItemUrl = (url, itemId) =>
  appendUrlFields(`${url}/items/${itemId}`);
const getCartUrl = (url) => appendUrlFields(url);

export default withSession(async (req, res) => {
  const { body = {}, method } = req;
  const { items } = JSON.parse(body);

  res.setHeader("Content-Type", "application/json");

  const cartSession = req.session.get(CART_CONSTANT);
  const cartAccessToken = get(cartSession, "accessToken");

  if (!cartAccessToken) {
    res.statusCode = 404;
    res.end("cart not found");
    return;
  }

  if (isEmpty(items)) {
    res.statusCode = 500;
    res.end("items not provided");
    return;
  }

  let cart = null;
  let cartUrl = `${reqApiHost(req)}/api/v2/carts/${cartAccessToken}`;

  let promises = null;
  switch (method) {
    case "DELETE":
      promises = map(items, async (item) => {
        return await fetch(getCartItemUrl(cartUrl, item), {
          headers: reqGetHeaders(req),
          method: "DELETE",
        }).then((result) => result.json());
      });
      break;
    case "PUT":
      promises = map(items, async (item) => {
        return await fetch(getCartItemsUrl(cartUrl), {
          headers: reqGetHeaders(req),
          method: "PUT",
          body: JSON.stringify(item),
        }).then((result) => result.json());
      });
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }

  cart = await Promise.all(promises).then(async () => {
    const result = await fetch(getCartUrl(cartUrl), {
      headers: reqGetHeaders(req),
    });
    return await result.json();
  });

  if (cart) {
    req.session.set(CART_CONSTANT, extractSessionCart(get(cart, "data")));
    await req.session.save();
  }

  res.statusCode = get(cart, "statusCode", 500);
  res.end(JSON.stringify(get(cart, "data", [])));
});
