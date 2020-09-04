import { reqExtractUri, reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default async (req, res) => {
  if (await outputCachedData(req, res, cache)) return;
  const result = await fetch(
    `${reqApiHost(req)}/api/v2/categories${reqExtractUri(req.url)}`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((r) => r.json());

  const data = result.data;
  saveDataToCache(req, cache, data);
  res.status(result.statusCode ? result.statusCode : 500).json(data);
};