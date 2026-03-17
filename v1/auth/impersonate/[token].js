import { get } from "lodash";
import withSession, {
  extractSessionUser,
  extractSessionCart,
} from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost, getApiExpand } from "grandus-lib/utils";
import {
  USER_CONSTANT,
  CART_CONSTANT,
} from "grandus-lib/constants/SessionConstants";

export default withSession(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    res.status(404).json(null);
    return;
  }

  let url = `${reqApiHost({})}/api/v2/users/${token}/load-user?expand=cart`;

  if (getApiExpand("LOGIN", false, "FIELDS")) {
    url += "&" + getApiExpand("LOGIN", true, "FIELDS");
  }

  const user = await fetch(url, {
    headers: reqGetHeaders(),
  }).then((result) => result.json());

  if (get(user, "statusCode") !== 200) {
    res.status(get(user, "statusCode")).json(get(user, "data.messages"));
    return;
  }

  if (get(user, "data.id")) {
    req.session.set(USER_CONSTANT, extractSessionUser(get(user, "data")));

    if (user?.data?.cart) {
      req.session.set(
        CART_CONSTANT,
        extractSessionCart(get(user, "data.cart"))
      );
    }

    await req.session.save();
  }

  res.status(200).json({ data: get(user, "data") });
});
