import withSession, { extractSessionCart } from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { CART_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get } from "lodash";

export default withSession(async (req, res) => {
  const { body = {}, method } = req;

  res.setHeader("Content-Type", "application/json");

  const cartSession = req.session.get(CART_CONSTANT);
  const cartAccessToken = get(cartSession, "accessToken");

  let url = `${reqApiHost(req)}/api/v2/carts/${cartAccessToken}/coupon`;

  const response = await fetch(url, {
    headers: reqGetHeaders(req),
    method: req.method,
    body: body,
  }).then((result) => result.json());

  req.session.set(
    CART_CONSTANT,
    extractSessionCart(get(response, "data.data"))
  );
  await req.session.save();

  res.status(get(response, "statusCode", 500)).json(get(response, "data"));

  // Update or create data in your database
  //   res.status(200).json({ id, name: name || `User ${id}` });
});
