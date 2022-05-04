import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get, isEmpty } from "lodash";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default withSession(async (req, res) => {
  if (await outputCachedData(req, res, cache)) return;

  const items = await fetch(
    `${reqApiHost(req)}/api/v2/users/${get(
      req.session.get(USER_CONSTANT),
      "id"
    )}/delivery-notes`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  if (!isEmpty(items?.data)) {
    saveDataToCache(req, cache, items?.data, { time: 30 });
  }

  try {
    res.status(200).json(items?.data);
  } catch (error) {
    res.status(500).json([]);
  }
});
