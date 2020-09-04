import { get } from "lodash";
import { reqGetHeaders, reqApiHost } from "grandus-lib/utils";
import cache, {
  outputCachedData,
  saveDataToCache,
} from "grandus-lib/utils/cache";

export default async (req, res) => {
  if (await outputCachedData(req, res, cache)) return;
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
    saveDataToCache(req, cache, data);
  }
  res.status(get(page, "statusCode", 500)).json(data);  
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
