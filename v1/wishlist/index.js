import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { transformWishlist } from "grandus-lib/utils/transformers";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get } from "lodash";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default withSession(async (req, res) => {
  if (
    await outputCachedData(req, res, cache, {
      cacheKeyType: "wishlist",
    })
  )
    return;

  const wishlist = await fetch(
    `${reqApiHost(req)}/api/v2/users/${get(
      req.session.get(USER_CONSTANT),
      "id"
    )}/wishlist`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  saveDataToCache(req, cache, wishlist?.data, {
    cacheKeyType: "wishlist",
  });

  res.status(200).json(transformWishlist(wishlist?.data));
});
