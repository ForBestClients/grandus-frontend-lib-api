import { reqExtractUri, reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";
import { get, toNumber } from "lodash";

export default async (req, res) => {
  const useCache = toNumber(get(req, 'query.cache', 1));
  if (useCache && await outputCachedData(req, res, cache)) return;

  const blocks = await fetch(
    `${reqApiHost(req)}/api/v2/static-blocks${reqExtractUri(req.url)}`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  if (useCache && get(blocks, "statusCode", 500) == 200) {
    saveDataToCache(req, cache, blocks?.data);
  }

  res.status(get(blocks, "statusCode", 500)).json(blocks?.data);
};
