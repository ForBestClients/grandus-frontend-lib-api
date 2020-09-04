import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default async (req, res) => {
  if (
    await outputCachedData(req, res, cache, {
      cacheKeyType: "webinstance",
    })
  )
    return;

  const data = await fetch(
    `${reqApiHost(req)}/api/web-instance?id=${process.env.GRANDUS_TOKEN_HOST}`,
    {
      headers: reqGetHeaders(req),
    }
  )
    .then((result) => result.json())
    .then((r) => r?.webInstance);

  saveDataToCache(req, cache, data, {
    cacheKeyType: "webinstance",
  });

  res.status(200).json(data);
};

export const config = {
  api: {
    externalResolver: true,
  },
};
