import { get } from "lodash";
import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default withSession(async (req, res) => {
  let cacheOptions = {};
  if (get(req, 'query.cacheForUser', false) == 'true') {
    cacheOptions = {
      cacheKeyType: "custom",
      cacheKeyParts: [get(req, "query.id")]
    };
  }
  if (await outputCachedData(req, res, cache, cacheOptions)) return;
  const page = await fetch(
    `${reqApiHost(req)}/api/v2/blogs/${get(
      req,
      "query.id"
    )}?expand=tags,category,text,gallery`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  const data = page?.data;
  if (get(page, "statusCode", 500) == 200) {
    saveDataToCache(req, cache, data, cacheOptions);
  }
  res.status(get(page, "statusCode", 500)).json(data);
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
