import { reqExtractUri, reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { get, toArray, sortBy, filter } from "lodash";
import { getApiBodyFromPath } from "grandus-lib/hooks/useFilter";
import withSession from "grandus-lib/utils/session";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default withSession(async (req, res) => {
  const cacheOptions = {
    cacheKeyType: "custom",
    cacheKeyParts: filter(
      ["filters", ...sortBy(toArray(get(req, "query")))],
      (item) => (item ? true : false) //skip empty
    ),
    cacheKeyUseUser: true, //@TODO conditional user caching true / false for better performance
  };

  if (await outputCachedData(req, res, cache, cacheOptions)) return;

  const result = await fetch(
    `${reqApiHost(req)}/api/v2/filters${reqExtractUri(req.url)}`,
    {
      method: "post",
      headers: reqGetHeaders(req),
      body: JSON.stringify({
        categoryName: get(req, "query.id", ""),
        search: get(req, "query.search", ""),
        ...getApiBodyFromPath(get(req, "query.param", [])),
      }),
    }
  ).then((r) => {
    return r.json();
  });

  const output = result.data;
  output.breadcrumbs = get(result, "breadcrumbs");
  output.meta = get(result, "meta");

  saveDataToCache(req, cache, output, cacheOptions);
  res.status(get(result, "statusCode", 500)).json(output);
});
