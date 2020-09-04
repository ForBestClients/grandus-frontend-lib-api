import { reqExtractUri, reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";
import { get } from "lodash";

export default async (req, res) => {
  if (await outputCachedData(req, res, cache)) return;

  const blocks = await fetch(
    `${reqApiHost(req)}/api/v2/static-blocks${reqExtractUri(req.url)}`,
    {
      headers: reqGetHeaders(req),
    }
  )
    .then((result) => result.json())
    .then((r) => get(r, "data", []));

  if (get(blocks, "statusCode", 500) == 200) {
    saveDataToCache(req, cache, blocks);
  }

  res.status(get(blocks, "statusCode", 500)).json(blocks);
};
