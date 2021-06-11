import withSession from "grandus-lib/utils/session";
import { USER_WISHLIST_CONSTANT, USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get, without, uniq, toNumber } from "lodash";
import { transformWishlist } from "grandus-lib/utils/transformers";
import { reqApiHost, reqGetHeaders } from "grandus-lib/utils";

const fallback = async (req, res, userId) => {
  const fallback = await fetch(
    `${reqApiHost(req)}/api/v2/users/${userId}/wishlist`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  return fallback?.data;
};

export default withSession(async (req, res) => {
  const { method, query } = req;
  const userId = get(req.session.get(USER_CONSTANT), "id");
  const productId = get(query, "productId");
  let productIds = req.session.get(USER_WISHLIST_CONSTANT);
  let newProductIds = null;
  let wishlist = null;

  productIds = productIds ? productIds : [];

  switch (method) {
    case "DELETE":
      if (!productIds) {
        res.status(200).json({ productIds: [], products: [] });
      }

      newProductIds = without(productIds, toNumber(productId));

      if (userId) {
        wishlist = await fetch(
          `${reqApiHost(req)}/api/v2/users/${userId}/wishlist/product/${productId}`,
          {
            headers: reqGetHeaders(req),
            method: method,
          }
        ).then((result) => result.json());

        if (wishlist?.statusCode !== 200) {
          wishlist = await fallback(req, res, userId);
        }

        newProductIds = transformWishlist(wishlist?.data)?.productIds;
      }

      req.session.set(USER_WISHLIST_CONSTANT, newProductIds);
      await req.session.save();

      res
        .status(200)
        .json({ productIds: newProductIds ? newProductIds : [], products: [] });
      break;

    case "POST":
      newProductIds = uniq([...productIds, toNumber(productId)]);

      if (userId) {
        wishlist = await fetch(
          `${reqApiHost(req)}/api/v2/users/${userId}/wishlist`,
          {
            headers: reqGetHeaders(req),
            method: method,
            body: JSON.stringify({ item: { productId: productId } }),
          }
        ).then((result) => result.json());

        if (wishlist?.statusCode !== 200) {
          wishlist = await fallback(req, res, userId);
        }

        newProductIds = transformWishlist(wishlist?.data)?.productIds;
      }


      req.session.set(USER_WISHLIST_CONSTANT, newProductIds);
      await req.session.save();

      res
        .status(200)
        .json({ productIds: newProductIds ? newProductIds : [], products: [] });
      break;

    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
