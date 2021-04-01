import withSession from "grandus-lib/utils/session";
import {
  USER_CONSTANT,
  USER_WISHLIST_CONSTANT,
} from "grandus-lib/constants/SessionConstants";
import { get, map } from "lodash";
import { reqApiHost, reqGetHeaders } from "grandus-lib/utils";
import { transformWishlist } from "grandus-lib/utils/transformers";

export default withSession(async (req, res) => {
  const { method } = req;
  const userId = get(req.session.get(USER_CONSTANT), "id");
  let productIds = req.session.get(USER_WISHLIST_CONSTANT);

  productIds = productIds ? productIds : [];

  let wishlist = null;
  switch (method) {
    case "POST":
      wishlist = await fetch(
        `${reqApiHost(req)}/api/v2/users/${userId}/wishlist/bulk`,
        {
          headers: reqGetHeaders(req),
          method: method,
          body: JSON.stringify({
            items: map(productIds, (productId) => ({ productId: productId })),
          }),
        }
      ).then((result) => result.json());

      if (wishlist?.statusCode !== 200) {
        await fallback(req, res, userId);
        return;
      }

      // saveDataToCache(req, cache, wishlist?.data, {
      //   cacheKeyType: "wishlist",
      // });

      const wishlistData = transformWishlist(wishlist?.data);
      req.session.set(USER_WISHLIST_CONSTANT, wishlistData?.productIds);
      await req.session.save();

      res.status(200).json(wishlistData);
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
