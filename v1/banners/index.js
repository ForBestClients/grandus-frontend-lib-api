import { reqExtractUri, reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default async (req, res) => {
  if (await outputCachedData(req, res, cache)) return;
  const banners = await fetch(
    `${reqApiHost(req)}/api/v2/banners${reqExtractUri(req.url)}`,
    {
      headers: reqGetHeaders(req),
    }
  ).then((result) => result.json());

  const data = banners?.data;
  if (banners.statusCode == 200) {
    saveDataToCache(req, cache, data);
  }

  res.status(banners.statusCode).json(data);
};
