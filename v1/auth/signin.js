import { get } from "lodash";
import withSession, { extractSessionUser, extractSessionCart } from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { USER_CONSTANT, CART_CONSTANT } from "grandus-lib/constants/SessionConstants";

export default withSession(async (req, res) => {
  const user = await fetch(`${reqApiHost({})}/api/v2/users/login?expand=cart`, {
    method: "POST",
    headers: reqGetHeaders(req),
    body: req.body,
  }).then((result) => result.json());

  if (get(user, "statusCode") !== 200) {
    res.statusCode = get(user, "data.code");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(get(user, "data.messages")));
  } else {
    req.session.set(USER_CONSTANT, extractSessionUser(get(user, "data")));
    if (user?.data?.cart) {
      req.session.set(CART_CONSTANT, extractSessionCart(get(user, "data.cart")));
    }
    await req.session.save();

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(get(user, "data")));
  }
});
