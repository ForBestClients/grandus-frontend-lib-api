import { get } from "lodash";
import withSession, {
  extractSessionUser,
  extractSessionCart,
} from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost, getApiExpand } from "grandus-lib/utils";
import {
  USER_CONSTANT,
  CART_CONSTANT, USER_WISHLIST_CONSTANT,
} from "grandus-lib/constants/SessionConstants";
import map from "lodash/map";

export default withSession(async (req, res) => {
  let url = `${reqApiHost({})}/api/v2/users/login?expand=cart,wishlist`;

  if (getApiExpand("LOGIN", false, "FIELDS")) {
    url += "&" + getApiExpand("LOGIN", true, "FIELDS");
  }

  const user = await fetch(url, {
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
      req.session.set(
        CART_CONSTANT,
        extractSessionCart(get(user, "data.cart"))
      );
    }
    if (user?.data?.wishlist) {
      req.session.set(
          USER_WISHLIST_CONSTANT,
          map(user?.data?.wishlist?.items, item =>item.product.id)
      );
    }
    await req.session.save();

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(get(user, "data")));
  }
});
