import withSession from "grandus-lib/utils/session";
import { USER_WISHLIST_CONSTANT } from "grandus-lib/constants/SessionConstants";

export default withSession(async (req, res) => {
  const productIds = req.session.get(USER_WISHLIST_CONSTANT);

  if (!productIds) {
    res.status(200).json({ productIds: [], products: [] });
    return;
  }

  res.status(200).json({ productIds, products: [] });
});