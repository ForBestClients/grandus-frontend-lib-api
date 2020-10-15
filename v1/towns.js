import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import { get } from "lodash";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default async (req, res) => {
  if (await outputCachedData(req, res, cache)) return;

  const result = await fetch(`${reqApiHost(req)}/api/v2/towns`, {
    headers: reqGetHeaders(req),
  }).then((r) => r.json());

  saveDataToCache(req, cache, get(result, "data", {}));
  res.status(get(result, "statusCode", 500)).json(get(result, "data", {}));
};