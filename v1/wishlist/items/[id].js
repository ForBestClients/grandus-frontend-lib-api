import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { transformWishlist } from "grandus-lib/utils/transformers";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get } from "lodash";
import cache, { saveDataToCache } from "grandus-lib/utils/cache";

const fallback = async (req, res, userId) => {
  const fallback = await fetch(
    `${reqApiHost(req)}/api/v2/users/${userId}/wishlist`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  saveDataToCache(req, cache, fallback?.data, {
    cacheKeyType: "wishlist",
  });

  res.status(200).json(transformWishlist(fallback?.data));
  return;
};

export default withSession(async (req, res) => {
  const { method, query } = req;
  const userId = get(req.session.get(USER_CONSTANT), "id");
  let wishlist = {};

  if (!userId) {
    res
      .status(401)
      .json({
        errorMessage:
          "Obľúbené produkty sú dostupné iba pre prihlásených používateľov.",
        ...transformWishlist(),
      });
    return;
  }

  switch (method) {
    case "DELETE":
      const itemId = get(query, "id");
      wishlist = await fetch(
        `${reqApiHost(req)}/api/v2/users/${userId}/wishlist/${itemId}`,
        {
          headers: reqGetHeaders(req),
          method: method,
        }
      ).then((result) => result.json());

      if (wishlist?.statusCode !== 200) {
        await fallback(req, res, userId);
        return;
      }

      saveDataToCache(req, cache, wishlist?.data, {
        cacheKeyType: "wishlist",
      });

      res.status(200).json(transformWishlist(wishlist?.data));
      break;

    case "POST":
      const productId = get(query, "id");
      wishlist = await fetch(
        `${reqApiHost(req)}/api/v2/users/${userId}/wishlist`,
        {
          headers: reqGetHeaders(req),
          method: method,
          body: JSON.stringify({ item: { productId: productId } }),
        }
      ).then((result) => result.json());

      if (wishlist?.statusCode !== 200) {
        await fallback(req, res, userId);
        return;
      }

      saveDataToCache(req, cache, wishlist?.data, {
        cacheKeyType: "wishlist",
      });

      res.status(200).json(transformWishlist(wishlist?.data));
      break;

    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
