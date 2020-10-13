import withSession, {
  extractSessionUser,
  extractSessionCart,
} from "grandus-lib/utils/session";
import {
  USER_CONSTANT,
  CART_CONSTANT,
  USER_WISHLIST_CONSTANT,
  USER_COMPARE_CONSTANT,
} from "grandus-lib/constants/SessionConstants";
import { transformWishlist } from "grandus-lib/utils/transformers";

export default withSession(async (req, res) => {
  // logout metoda na backende?
  //   const user = await fetch(`${reqApiHost({})}/api/v2/users/login`, {
  //     method: "POST",
  //     headers: reqGetHeaders(req),
  //     body: req.body,
  //   }).then((result) => result.json());

  req.session.set(USER_COMPARE_CONSTANT, []);
  req.session.set(USER_CONSTANT, extractSessionUser({}));
  req.session.set(CART_CONSTANT, extractSessionCart({}));
  req.session.set(USER_WISHLIST_CONSTANT, transformWishlist({}));
  await req.session.save();

  //   req.session.unset(USER_CONSTANT);
  //   req.session.unset(CART_CONSTANT);
  //   req.session.unset(USER_COMPARE_CONSTANT);
  //   req.session.unset(USER_WISHLIST_CONSTANT);
  //   await req.session.save();

  await req.session.destroy();

  const user = req.session.get(USER_CONSTANT);
  res.status(200).json(user ? user : {});
});
