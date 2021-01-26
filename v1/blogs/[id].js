import { get } from "lodash";
import withSession from "grandus-lib/utils/session";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default withSession(async (req, res) => {
  if (await outputCachedData(req, res, cache, {
    cacheKeyType: "custom",
    cacheKeyParts: [get(req, "query.id")],
    cacheKeyUseUser: true,
  })) return;
  const page = await fetch(
    `${reqApiHost(req)}/api/v2/blogs/${get(
      req,
      "query.id"
    )}?expand=tags,category,text`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  const data = page?.data;
  if (get(page, "statusCode", 500) == 200) {
    saveDataToCache(req, cache, data, {
      cacheKeyType: "custom",
      cacheKeyParts: [get(req, "query.id")],
      cacheKeyUseUser: true,
    });
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
