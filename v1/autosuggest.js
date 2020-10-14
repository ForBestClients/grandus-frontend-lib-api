import { reqExtractUri, reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";
import { get, isEmpty } from "lodash";

export default async (req, res) => {
  if (await outputCachedData(req, res, cache)) return;

  const response = await fetch(
    `${reqApiHost(req)}/api/v2/autosuggest/${reqExtractUri(req.url)}`,
    {
      headers: reqGetHeaders(req),
    }
  )
    .then((result) => result.json())
    .then((r) => get(r, "data", []));
  const statusCode = !isEmpty(response) ? 200 : 500;
  if (statusCode == 200) {
    saveDataToCache(req, cache, response);
  }

  res.status(statusCode).json(response);
};
